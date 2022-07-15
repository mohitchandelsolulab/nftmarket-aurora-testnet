import { useEffect, useState } from "react"
import { ethers } from 'ethers'
import { Grid, Row, Col, Text } from "@nextui-org/react"
import OwnedSingleCard from "./OwnedSingleCard"
import { CONTRACT } from "../../secret.json"
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import Swal from "sweetalert2"
import { useRouter } from 'next/router'


export default function OwnedNftGrid() {
    const router = useRouter()
    const [allItems, setAllItems] = useState([])

    async function fetchNfts() {
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const walletAddress = await signer.getAddress()
            let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, signer)
            let items = await contract.getOwnedItems(walletAddress)
            setAllItems(items)
        } catch(err){
            Swal.fire({
                title: 'Error',
                text: "Connect Wallet",
                icon: 'error',
                confirmButtonText: 'close',
            }).then(() => {
                router.push('/')
            })
        }
    }

    useEffect(() => {
        fetchNfts()
    }, [])


    return (
        <>
        {allItems.length > 0 ? 
            <Grid.Container gap={2} justify="center">
                {allItems.map((items, i) =>
                    items.itemId != 0 ?
                        <Grid key={i} xs={12} sm={4} md={3}>
                            <OwnedSingleCard id={Number(items.itemId)} />
                        </Grid>
                    : ""
                )}
            </Grid.Container> : 
            <Row justify="center">
                <Col align={"center"}>
                    <Text h2>
                        No Items To Fetch
                    </Text>
                </Col>
            </Row>
        }
        </>
    )
}