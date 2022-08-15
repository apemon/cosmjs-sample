import { create_wallet, upload, init, query, execute } from './util'

require('dotenv').config()
const { MNEMONIC, NETWORK } = process.env;

(async () => {
    const { address: senderAddress, signer: wallet } = await create_wallet(NETWORK, MNEMONIC);
    console.log(senderAddress)
    // upload code
    const code_path = '../wasm/cw721_metadata_onchain.wasm'
    console.log(code_path)
    const code_id = await upload(senderAddress, wallet, code_path)
    console.log(code_id)
    // initialize contract
    const response = await init(senderAddress, wallet, code_id, {
        name: 'Test NFT',
        symbol: 'Test',
        minter: senderAddress,
    }, 'nft')
    const nft_address = response
    console.log(nft_address)
    // const nft_address = response.contract_addr
    // console.log(`nft address: ${nft_address}`)
    // // get minter info
    const minter: any = await query(wallet, nft_address, {
        minter: {}
    })
    console.log(minter)
    // mint nft
    await execute(senderAddress, wallet, nft_address, {
        mint: {
            token_id: '0',
            owner: senderAddress,
            token_uri: "ipfs://Qmda4kjAjKftooGZeaXbpSjwRVf4BubM4DVBZ38wtq4LYz",
            extension: {
                image: "ipfs://Qmda4kjAjKftooGZeaXbpSjwRVf4BubM4DVBZ38wtq4LYz",
                description: '',
                name: `FakePunk #2`,
                attributes: [
                    {
                        trait_type: "backgrounds",
                        value: "night blue"
                    },
                    {
                        trait_type: "suits",
                        value: "royal spacesuit"
                    }
                ]
            }
        }
    })
    // // get nft info
    const nft_info = await query(wallet, nft_address, {
        nft_info: {
            token_id: '0'
        }
    })
    console.log(nft_info)
})()