--[[
    Orca Phone v23.5 Platinum - Server Side
    Sistema de Validação e Segurança Master (vRP FIX)
]]

local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")

RegisterServerEvent("orca_phone:server:bankAction", function(data)
    local source = source
    local user_id = vRP.getUserId(source)
    if not user_id then return end

    local type = data.type
    local amount = tonumber(data.amt)
    local target_id = tonumber(data.id)

    -- Validação de Valor Negativo ou Não Numérico
    if not amount or amount <= 0 then 
        vRPclient.notify(source, "~r~Valor inválido!")
        return 
    end

    if type == "deposit" then
        if vRP.tryPayment(user_id, amount) then
            vRP.giveBankMoney(user_id, amount)
            vRPclient.notify(source, "~g~Depósito de R$" .. amount .. " concluído!")
        else
            vRPclient.notify(source, "~r~Dinheiro insuficiente na carteira!")
        end
    elseif type == "withdraw" then
        if vRP.tryWithdraw(user_id, amount) then
            vRPclient.notify(source, "~g~Saque de R$" .. amount .. " concluído!")
        else
            vRPclient.notify(source, "~r~Dinheiro insuficiente no banco!")
        end
    elseif type == "transfer" then
        if not target_id or target_id == user_id then
            vRPclient.notify(source, "~r~ID de destino inválido!")
            return
        end

        local nsource = vRP.getUserSource(target_id)
        if nsource then
            if vRP.tryFullPayment(user_id, amount) then
                vRP.giveBankMoney(target_id, amount)
                vRPclient.notify(source, "~g~Transferência de R$" .. amount .. " para ID " .. target_id .. " concluída!")
                vRPclient.notify(nsource, "~g~Você recebeu um PIX de R$" .. amount .. " do ID " .. user_id .. "!")
            else
                vRPclient.notify(source, "~r~Saldo insuficiente!")
            end
        else
            vRPclient.notify(source, "~r~Usuário não encontrado ou offline!")
        end
    end
end)
