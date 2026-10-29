---
title: 'Forza Horizon 4 on a Mac: a crash that is not in any patch'
description: 'Notes from a debugging session: a random startup crash, a sign-in window that takes minutes to load, and the three hypotheses that turned out to be wrong.'
pubDate: 2026-10-29
category: devlog
tags: ['debugging', 'wine', 'macos', 'games']
draft: false
---

These are notes from a Claude Code debugging session on an Apple Silicon Mac, getting
Forza Horizon 4 (the Steam version) to run under CrossOver 26.3 with Apple's game porting
toolkit. The setup used a community patch set by whyAm-i for the launch and rendering
problems. This post is about what the session found *after* those patches were in; it does
not describe the patches themselves.

The outcome: the game became playable — about an hour tested, with some lag and texture
glitches (the patch author also notes buggy textures). Two problems were never explained, and
three of the session's own explanations were wrong. Each finding below says whether it was
observed or guessed.

## The startup crash

About half of launches die ten to twenty seconds in, behind Wine's generic crash dialog.

![Wine's "ForzaHorizon4.exe has encountered a serious problem" dialog with a Wine Debugger window behind it](/fh4/crash-dialog.png)

**Observed.** Every one has the same signature: a null-pointer read inside `ucrtbase.dll`,
the C runtime, where the game passes a null string to a string function. The backtrace runs
`ucrtbase+0x7c0d7`, then `forzahorizon4+0x77b1db`, then further frames inside the game's own code,
then `kernel32` and `ntdll`. **None of the patched DLLs is in the chain.**

**Observed.** The cause cannot be found by reading the code. The bytes at that address in the
executable are not valid instructions, which is consistent with code that is encrypted on
disk and only decrypted at runtime, so static disassembly shows nothing. A disassembler session was attempted and never
got started.

**Unexplained.** Why it is intermittent.

## What does change the odds

- **Launching the executable directly crashed 3 of 3 times**, each within about ten seconds.
- **Launching through Steam** — `steam.exe -applaunch <appid>` against a Steam that is already
  running and idle — survives about half the time, typically within a few attempts.

*Guess:* Steam hands the game something it needs, such as its app ID, and a direct launch
lacks it. This was not tested.

The practical answer is a retry loop with a way to tell whether a launch survived. The
patched Direct3D layer writes a log, and a surviving launch is one where that log shows
rendering (over fifty `REGISTER_PSO` lines) before it shows an access violation:

```bash
CX="/Applications/CrossOver.app/Contents/SharedSupport/CrossOver"
B="$HOME/Library/Application Support/CrossOver/Bottles/Steam"
L="$B/drive_c/highball/logs"          # log directory of the D3D12 shim

for a in $(seq 1 20); do
  pkill -9 -f "ForzaHorizon4|winedbg"; sleep 3
  rm -f "$L"/tsshim-*.log
  nohup "$CX/bin/wine" --bottle Steam \
    "C:\\Program Files (x86)\\Steam\\steam.exe" -applaunch 1293830 >/dev/null 2>&1 &
  res=timeout
  for i in $(seq 1 30); do
    sleep 4
    pso=$(cat "$L"/tsshim-*.log 2>/dev/null | grep -c REGISTER_PSO)
    crash=$(cat "$L"/tsshim-*.log 2>/dev/null | grep -c 0xc0000005)
    [ "$pso" -gt 50 ]   && { res=ALIVE; break; }
    [ "$crash" -gt 0 ] && { res=CRASH; break; }
  done
  echo "attempt $a: $res"; [ "$res" = ALIVE ] && break
done
```

The catch is that this uses the shim's debug log as its liveness check, and that log grows
fast (47 MB in one sitting). Turning debug logging off means changing the check to watch for
the game process instead.

## Three explanations that were wrong

**1. "`GetPackagePath` is the cause."** Before every crash Wine prints `unimplemented function
KERNEL32.dll.GetPackagePath, aborting`, right before the fault. It looks causal. It is not
established: the patch author's own reference setup logs the same line and runs fine, and the
patch hooks a different API. It is noise.

**2. "The helper DLLs fixed it."** After copying in two small Wine helper DLLs, the next launch
ran — thousands of rendering calls logged. The session said so. The next launches crashed
again. One surviving run in a coin-flip is not a fix; the claim was withdrawn as premature.

**3. "WebView2 is crashing the game."** With Microsoft's WebView2 runtime installed, 0 of 7
launches survived; with it renamed out of the way, 1 of 1 did. That looked like a result. It
was a small sample, and the sign-in window turned out not to be WebView2 at all (next section).
Restoring the folder did not start a single `msedgewebview2` process.

What survived scrutiny from this stretch was smaller: the **first** crash, in the stock
`TargetHardwareProfiler.dll`, was found by mapping the faulting address to a module, and
renaming that DLL out of the game folder made that particular crash go away.

## The sign-in window

At the title screen, pressing Enter opens an Xbox sign-in window that shows
"LOADING... PLEASE WAIT" and nothing else.

- **Observed.** It is the game's own `ForzaWebHelper.exe`, a CEF-based browser shipped in the
  game folder, not WebView2.
- **Observed.** It is working, not blocked: its renderer sat at roughly 60–68 percent CPU for
  minutes with a single open HTTPS connection. The page appeared **three to six minutes** after
  the game started. In one attempt it had still not loaded after six minutes.
- **Observed.** Closing the window with Back, on a page that was by the user's account waiting
  at a passkey step, crashed the game, with a different signature from the startup crash: execution jumped to address `0x0`,
  a call through a null function pointer. Closing it while it was still on "LOADING" was
  harmless.
- *Guess:* the cancel path leaves a result handler unset. Not verified.
- *Guess, from general knowledge:* a passkey prompt relies on the Windows WebAuthn API, which
  nothing in Wine provides, so that step can wait forever. Choosing the password or
  authenticator-app option is the route around it.

## What worked as a method

- **Record every command with timestamps.** `set -x` with a time in `PS4` meant that later
  questions — how long after launch did the window appear — could be answered from the log.
- **Give a launch a pass/fail oracle** before comparing anything, so "it crashed" is a count.
- **Map a faulting address to a module** before theorising. It resolved one crash outright and
  ruled the patched DLLs out of another.
- **Tag guesses as guesses.** At least one of the wrong explanations above was stated with more
  confidence than one lucky run supported, and it was the later runs that caught it.
- **`WINEDEBUG` on the command line did nothing.** `+loaddll` produced no DLL-load lines even
  in a direct launch, so CrossOver's wrapper seems to override it. A capture of the sign-in
  calls would have to set the channels in the bottle's own configuration; that was proposed
  and not finished.

## Still unknown

- Why roughly half of launches crash, and what a surviving launch does differently.
- Whether the closing-the-window crash is really about the passkey step.
- Why one sign-in window needs minutes to load.

*Written on 29 Oct 2026 from the session's notes, run logs and transcript. Process IDs,
account details and network configuration are deliberately left out.*
