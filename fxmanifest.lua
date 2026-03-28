fx_version 'cerulean'
game 'gta5'

author 'Orca RP - Antigravity Elite'
description 'Celular iPhone 15 Pro Max Elite (v23.5 Platinum)'
version '1.0'

lua54 'yes'

-- [ Dependências vRP ]
dependency "vrp"

client_scripts {
    "@vrp/lib/utils.lua",
    "client.lua"
}

server_scripts {
    "@vrp/lib/utils.lua",
    "server.lua"
}

ui_page "html/index.html"

files {
    "html/index.html",
    "html/style.css",
    "html/script.js",
    "html/output.css",
    "html/SF-Pro-Display-Regular.otf", -- placeholder if font is local
    "html/SF-Pro-Display-Bold.otf"
}

-- [ Metadata ]
provide "orca_phone"
v18_ready "yes"
