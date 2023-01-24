# -*- mode: python ; coding: utf-8 -*-
# pip install PyInstaller==4.3
# usage: pyinstaller --onefile --clean -y wetube.spec

import sys
import os

path = os.path.abspath(".")
block_cipher = None

added_files = []

a = Analysis(['..\\main.py'],
             pathex=['.'],
             binaries=[],
             datas=None,
             # datas=added_files,
             # hiddenimports=['win32timezone'],
             hiddenimports=[],
             hookspath=[],
             # hookspath=hookspath(),
             runtime_hooks=[],
             # runtime_hooks=runtime_hooks(),
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)

pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)

# a.datas += added_files

exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='WebSocketServerTest',
          debug=False,
          strip=False,
          upx=True,
          console=True, 
          icon='../assets/unnamed.ico' )
