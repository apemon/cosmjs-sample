import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Decimal } from '@cosmjs/math'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice, parseCoins } from '@cosmjs/stargate'
import { StdFee, Coin } from '@cosmjs/amino'
import * as fs from 'fs'

require('dotenv').config()

const DELAY_TIME = 1000 // this to prevent unauthorization error
const GAS_LIMIT = 10000000

const { NETWORK } = process.env

const networks = {
    local: {
        URL: 'http://localhost:26657',
        chainID: 'testing',
        gasAdjustment: 1.5,
        denom: 'ujunox',
        gasPrice: '25000'
    },
    testnet: {
        URL: 'https://pisco-lcd.terra.dev',
        chainID: 'uni-3',
        gasAdjustment: 1.5
    },
    mainnet: {
        URL: 'https://phoenix-lcd.terra.dev',
        chainID: 'phoenix-1',
        gasAdjustment: 1.5
    }
}

export const instantiate = async (network) => {
    return await CosmWasmClient.connect(networks[network].URL)
}

export const create_wallet = async (network: string, mnemonic) => {
    const url = networks[network].URL
    try {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'juno' })
        const accounts = await wallet.getAccounts()
        const address = accounts[0].address
        const gasPrice = new GasPrice(Decimal.fromAtomics(networks[network].gasPrice, 6), networks[network].denom)
        const signer = await SigningCosmWasmClient.connectWithSigner(url, wallet, {
            gasPrice
        })
        return {
            address,
            signer
        }
    } catch (err) {
        console.log(err)
    }
}

export const upload = async (
    senderAddress: string,
    wallet: SigningCosmWasmClient,
    path: string
): Promise<number> => {
    const wasm = fs.readFileSync(path)
    try {
        const uploadResult = await wallet.upload(senderAddress, wasm, 'auto')
        console.log(uploadResult)
        return uploadResult.codeId
    } catch (err) {
        console.log(err)
        throw err
    }
}

export const init = async (
    senderAddress: string,
    wallet: SigningCosmWasmClient,
    code_id: number,
    init_msg: Record<string, any>,
    label: string
): Promise<string> => {
    const initResult = await wallet.instantiate(senderAddress, code_id, init_msg, label, 'auto')
    console.log(initResult)
    return initResult.contractAddress
}

export const execute = async (
    senderAddress: string,
    wallet: SigningCosmWasmClient,
    addr,
    execute_msg,
    coinString?,
) => {
    let coins: Coin[]
    if (coinString) {
        coins = parseCoins(coinString)
    }
    const response = await wallet.execute(senderAddress, addr, execute_msg, 'auto', '', coins)
    await delay(DELAY_TIME)
    return response;
}

export const query = async (wallet: SigningCosmWasmClient, address: string, msg: any) => {
    const response = await wallet.queryContractSmart(address, msg)
    return response
}

export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms, {}))
}