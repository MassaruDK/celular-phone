--[[
    Orca Phone v23.5 Platinum - Client Side
    Focado em Performance (0.01ms) e Estabilidade de NUI (vRP FIX)
]]

local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")
vRPserver = Tunnel.getInterface("vRP")

local phoneOpen = false

-- Cache de Horário para NUI (Performance 0.01ms)
Citizen.CreateThread(function()
    while true do
        local idle = 1000
        if phoneOpen then
            idle = 250
            local h, m = GetClockHours(), GetClockMinutes()
            local time = string.format("%02d:%02d", h, m)
            
            SendNUIMessage({
                action = "updateStatus",
                time = time
            })
        end
        Citizen.Wait(idle)
    end
end)

-- Comandos e Teclas
RegisterCommand("celular", function()
    TogglePhone()
end)

RegisterKeyMapping("celular", "Abrir Celular", "keyboard", "k")

function TogglePhone()
    phoneOpen = not phoneOpen
    if phoneOpen then
        SetNuiFocus(true, true)
        SendNUIMessage({ action = "open" })
    else
        SetNuiFocus(false, false)
        SendNUIMessage({ action = "close" })
    end
end

-- Callbacks NUI
RegisterNUICallback("closeHandshake", function(data, cb)
    SetNuiFocus(false, false)
    phoneOpen = false
    cb("ok")
end)

RegisterNUICallback("getBankData", function(data, cb)
    -- Obtém dados via server call ou local cache
    local user_id = vRP.getUserId(PlayerPedId())
    if user_id then
        local bank = vRP.getBankMoney(user_id)
        local wallet = vRP.getMoney(user_id)
        local identity = vRP.getUserIdentity(user_id)
        
        cb({
            bank = bank,
            wallet = wallet,
            name = identity.name .. " " .. identity.firstname
        })
    else
        cb({ bank = 0, wallet = 0, name = "Cidadão" })
    end
end)

RegisterNUICallback("bankAction", function(data, cb)
    TriggerServerEvent("orca_phone:server:bankAction", data)
    cb("ok")
end)

-- Handlers de Câmera e UI (Regra 1 do Orca RP)
AddEventHandler("onResourceStop", function(resourceName)
    if GetCurrentResourceName() == resourceName then
        RenderScriptCams(false, false, 0, true, true)
        DestroyAllCams(true)
        SetNuiFocus(false, false)
        FreezeEntityPosition(PlayerPedId(), false)
    end
end)
