import { useState, useEffect } from 'react'
import { Container, Input, Row, Button, Loading } from "@nextui-org/react"
import Navigation from "../components/Navigation"
import { create } from 'ipfs-http-client'
import { ethers } from 'ethers'
import { CONTRACT } from "../secret.json"
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')

export default function MyNfts() {

    const [isLoading, setIsLoading] = useState(false)
    const [fileUrl, setFileUrl] = useState("")
    const router = useRouter()

    async function checkForWallet() {
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const walletAddress = await signer.getAddress()
            console.log(walletAddress)
        } catch(err){
            Swal.fire({
                title: 'Error',
                text: "Connect Wallet First",
                icon: 'error',
                confirmButtonText: 'close',
            }).then(() => {
                router.push('/')
            })
        }
    }

    useEffect(() => {
        checkForWallet()
    }, [])

    async function fileUploaded(e) {
        const file = e.target.files[0]
        try {
            const addedFile = await ipfsClient.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const fileUrl = `https://ipfs.infura.io/ipfs/${addedFile.path}`
            setFileUrl(fileUrl)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    const listItem = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const name = e.target.elements.name.value
        const desc = e.target.elements.desc.value
        const price = e.target.elements.price.value
        if (!(price > 0)) {
            setIsLoading(false)
            alert("Price should be greater than 0")
            return;
        }
        if (!name || !desc || !price || !fileUrl) {
            setIsLoading(false)
            alert("Please fill all the input values")
            return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const finalPrice = ethers.utils.parseUnits(price, 'ether')
        let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, signer)
        try {
            const tx = await contract.listItem(name, desc, finalPrice, fileUrl)
            await tx.wait()
            Swal.fire({
                title: 'Success',
                html: `Transaction successfully <br><a href="https://rinkeby.etherscan.io/tx/${tx.hash}"><u>view on explorer</u></a> `,
                icon: 'Success',
                confirmButtonText: 'Done',
            }).then(
                router.push('/')
            )
            setIsLoading(false)
        } catch (err) {
            console.log(err.message)
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'Close',
            })
            setIsLoading(false)
        }
    }

    return (
        <>
            <div>
                <Navigation />
            </div>
            <Container>
                <form onSubmit={listItem}>
                    <Row css={{ padding: "30px 0" }} justify="center" align="center">
                        <Input
                            size="lg"
                            bordered
                            name="name"
                            label="Name"
                            color="#7928ca"
                            helperText="Please enter NFT name"
                        />
                    </Row>
                    <Row css={{ padding: "30px 0" }} justify="center">
                        <Input
                            size="lg"
                            bordered
                            name="desc"
                            color="#7928ca"
                            label="Item description"
                            helperText="Please enter your description"
                        />

                    </Row>
                    <Row css={{ padding: "30px 0" }} justify="center">
                        <Input
                            initialValue={0.001}
                            inputted="numeric"
                            size="lg"
                            bordered
                            name="price"
                            label="Price (ETH)"
                            color="#7928ca"
                            helperText="Please enter NFT price"/>

                    </Row>
                    <Row css={{ padding: "30px 0" }} justify="center">
                        <Input
                            underlined
                            size="lg"
                            label="NFT Image"
                            color="#7928ca"
                            type="file"
                            helperText="Please enter file"
                            onChange={fileUploaded} />
                    </Row>
                    <Row css={{ padding: "30px 0" }} justify="center">
                        {isLoading ?
                            <Button disabled>
                                <Loading color="currentColor" size="sm" />
                            </Button>
                            :
                            <Button color={"success"} type="submit">Create Item</Button>
                        }
                    </Row>
                </form>
            </Container>
        </>
    )
}