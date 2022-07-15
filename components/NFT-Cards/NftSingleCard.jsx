import { useEffect, useState } from "react"
import { Card, Col, Row, Button, Text, Modal, Image, Loading } from "@nextui-org/react"
import { CONTRACT } from "../../secret.json"
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import Swal from 'sweetalert2'


export default function NftSingleCard({ id }) {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)

    const [itemId, setItemId] = useState()
    const [itemName, setItemName] = useState()
    const [itemDescription, setItemDescription] = useState()
    const [itemOwner, setItemOwner] = useState()
    const [itemPrice, setItemPrice] = useState()
    const [itemUrl, setItemUrl] = useState()

    const [walletAddress, setWalletAddress] = useState()

    const [visible, setVisible] = useState(false);
    const handler = () => setVisible(true);
    const closeHandler = () => {
        setVisible(false);
        console.log("closed");
    };

    async function getSingleItems() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, provider)
            let item = await contract.getSingleItem(id)
            setItemId(item[id].itemId)
            setItemDescription(item[id].description)
            setItemName(item[id].name)
            setItemOwner(item[id].owner)
            setItemPrice(ethers.utils.formatEther(item[id].price))
            setItemUrl(item[id].tokenURI)
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'Close',
            })
        }
    }

    async function getWalletAddress() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const address = await signer.getAddress()
            setWalletAddress(address)

        } catch (err) {
            console.log(err)
            console.log(walletAddress)
        }
    }

    useEffect(() => {
        getSingleItems()
        getWalletAddress()
    }, [])

    async function buyNft() {
        setIsLoading(true)
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, signer)
            let balance = await provider.getBalance(await signer.getAddress());
            const nftPriceValue = ethers.utils.parseEther(itemPrice)
            if (Number(balance) < Number(nftPriceValue)) {
                alert("not enough funds")
                return
            }
            let tx = await contract.buyItem(itemId, { value: nftPriceValue })
            await tx.wait()
            closeHandler()
            Swal.fire({
                title: 'Success',
                html: `Transaction successfully <br><a href="https://testnet.aurorascan.dev/tx/${tx.hash}"><u>view on explorer</u></a> `,
                icon: 'Success',
                confirmButtonText: 'Done',
            }).then(
                router.push('/')
            )
            setIsLoading(false)
        } catch (err) {
            closeHandler()
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
            <Card cover css={{ w: "100%", p: 0 }}>
                <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
                </Card.Header>
                <Card.Body>
                    <Card.Image
                        src={itemUrl}
                        height={400}
                        width="100%"
                        alt="Relaxing app background"
                    />
                </Card.Body>
                <Card.Footer
                    blur
                    css={{
                        backgroundColor: "#000",
                        position: "absolute",
                        bgBlur: "#000",
                        borderTop: "$borderWeights$light solid $gray700",
                        bottom: 0,
                        zIndex: 1,
                    }}
                >
                    <Row>
                        <Col css={{ marginTop: "1%" }} bottom={0}>
                            <Text size={12} transform="uppercase" color="#fff">
                                {itemName}
                            </Text>
                            <Text weight={"bold"} justify="center" color="success" size={12}>
                                {Number(itemPrice)} ETH
                            </Text>
                        </Col>
                        <Col>
                            <Row justify="flex-end">
                                <Button.Group color="success" >
                                    <Button
                                        rounded
                                        onClick={handler}
                                    >
                                        <Text
                                            css={{ color: "inherit" }}
                                            size={12}
                                            weight="bold"
                                            transform="uppercase"
                                        >
                                            View NFT
                                        </Text>
                                    </Button>
                                    {walletAddress != itemOwner && walletAddress ?
                                        <Button
                                            disabled={isLoading}
                                            flat
                                            auto
                                            rounded
                                            onClick={buyNft}
                                        >
                                            {isLoading ?
                                                <Loading color="currentColor" size="sm" />
                                                :
                                                <Text
                                                    css={{ color: "inherit" }}
                                                    size={12}
                                                    weight="bold"
                                                    transform="uppercase"
                                                >
                                                    Buy NFT
                                                </Text>
                                            }
                                        </Button>
                                        : ""}
                                </Button.Group>
                            </Row>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>

            <Modal
                css={{ padding: "10px" }}
                blur
                aria-labelledby="modal-title"
                noPadding
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text h2 id="modal-title" >
                        {itemName}
                    </Text>
                </Modal.Header>
                <Modal.Body >
                    <Row justify="center">
                        <Text id="modal-description">
                            {itemDescription}
                        </Text>
                    </Row>
                    <Row justify={"center"}>
                        <Text size={12} id="modal-description">
                            Owner: {itemOwner}
                        </Text>
                    </Row>
                    <Row>
                        <Image
                            showSkeleton
                            src={itemUrl}
                        />
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Row>
                        <Col >
                            <Row justify="center">
                                {isLoading
                                    ?
                                    <Button disabled auto>
                                        <Loading color="currentColor" size="sm" />
                                    </Button>
                                    :
                                    <Button
                                        disabled={walletAddress && walletAddress != itemOwner ? false : true}
                                        color={"success"}
                                        onClick={buyNft}
                                        auto
                                    >
                                        Buy For {itemPrice} ETH
                                    </Button>
                                }

                            </Row>
                        </Col>
                    </Row>
                </Modal.Footer>
            </Modal>
        </>
    )
}
