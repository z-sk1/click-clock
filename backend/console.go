package main

import (
	"syscall"
)

var (
	kernel32         = syscall.NewLazyDLL("kernel32.dll")
	user32           = syscall.NewLazyDLL("user32.dll")
	getConsoleWindow = kernel32.NewProc("GetConsoleWindow")
	showWindow       = user32.NewProc("ShowWindow")
	allocConsole     = kernel32.NewProc("AllocConsole")
	freeConsole      = kernel32.NewProc("FreeConsole")
)

const (
	SW_HIDE = 0
	SW_SHOW = 5
)

func getConsoleWindowHandle() uintptr {
	ret, _, _ := getConsoleWindow.Call()
	return ret
}

func showConsole(show bool) {
	hwnd := getConsoleWindowHandle()

	if show {
		if hwnd == 0 {
			// no console yet, create
			allocConsole.Call()
			attachConsoleStdio()
			// get new handle after allocating window
			hwnd = getConsoleWindowHandle()
			// now show it immediately
			showWindow.Call(hwnd, SW_SHOW)
		} else {
			// console exist, yay!! now just show it
			showWindow.Call(hwnd, SW_SHOW)
		}
	} else {
		if hwnd != 0 {
			// console exist, so hide!!
			showWindow.Call(hwnd, SW_HIDE)
		}
	}
}
