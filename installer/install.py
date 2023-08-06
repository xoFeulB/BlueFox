import winreg
import requests
import json
import os


class Config:
    class Path:
        class Chrome:
            LOCAL_MACHINE = ""
            CURRENT_USER = ""
        class Edge:
            LOCAL_MACHINE = ""
            CURRENT_USER = ""

try:
    key = winreg.OpenKeyEx(winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe")
    data, regtype = winreg.QueryValueEx(key, "Path")
    winreg.CloseKey(key)
    Config.Path.Chrome.LOCAL_MACHINE = data
except:
    pass

try:
    key = winreg.OpenKeyEx(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe")
    data, regtype = winreg.QueryValueEx(key, "Path")
    winreg.CloseKey(key)
    Config.Path.Chrome.CURRENT_USER = data
except:
    pass

try:
    key = winreg.OpenKeyEx(winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\App Paths\IEXPLORE.EXE")
    data, regtype = winreg.QueryValueEx(key, "Path")
    winreg.CloseKey(key)
    Config.Path.Edge.LOCAL_MACHINE = data
except:
    pass

try:
    key = winreg.OpenKeyEx(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\App Paths\IEXPLORE.EXE")
    data, regtype = winreg.QueryValueEx(key, "Path")
    winreg.CloseKey(key)
    Config.Path.Edge.CURRENT_USER = data
except:
    pass

print(os.path.expanduser('~'))
print(Config.Path.Chrome.LOCAL_MACHINE)
print(Config.Path.Chrome.CURRENT_USER)
print(Config.Path.Edge.LOCAL_MACHINE)
print(Config.Path.Edge.CURRENT_USER)