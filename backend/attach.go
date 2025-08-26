package main

import (
	"os"
	"syscall"
)

func attachConsoleStdio() {
	const (
		STD_INPUT_HANDLE  = uintptr(^uint32(10) + 1) // (DWORD)-10
		STD_OUTPUT_HANDLE = uintptr(^uint32(11) + 1) // (DWORD)-11
		STD_ERROR_HANDLE  = uintptr(^uint32(12) + 1) // (DWORD)-12
	)

	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	getStdHandle := kernel32.NewProc("GetStdHandle")

	stdinHandle, _, _ := getStdHandle.Call(STD_INPUT_HANDLE)
	if stdinHandle != 0 {
		os.Stdin = os.NewFile(stdinHandle, "stdin")
	}

	stdoutHandle, _, _ := getStdHandle.Call(STD_OUTPUT_HANDLE)
	if stdoutHandle != 0 {
		os.Stdout = os.NewFile(stdoutHandle, "stdout")
	}

	stderrHandle, _, _ := getStdHandle.Call(STD_ERROR_HANDLE)
	if stderrHandle != 0 {
		os.Stderr = os.NewFile(stderrHandle, "stderr")
	}
}
