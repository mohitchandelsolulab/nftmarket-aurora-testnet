import { useEffect, useState } from "react"
import { ethers } from 'ethers'
import { Grid } from "@nextui-org/react"
import NftSingleCard from "./NftSingleCard"
import { CONTRACT } from "../../secret.json"
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import Swal from "sweetalert2"


export default function NftGrid() {

    const [allItems, setAllItems] = useState([])
    
    async function fetchNfts() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, provider)
        let items = await contract.getAllItemsForSale()
        setAllItems(items)
    }
    
    useEffect(() => {
        fetchNfts()
    }, [])


    return (
        <>
            <Grid.Container gap={2} justify="center">
                {allItems.map((items, i) =>
                    items.itemId != 0 ?
                        <Grid key={i} xs={12} sm={4} md={3}>
                            <NftSingleCard id={Number(items.itemId)} />
                        </Grid>
                    : ""
                )}
            </Grid.Container>
        </>
    )
}
