import { useEffect, useState } from "react"
import { Card, Col, Row, Button, Text, Modal, Input, Loading } from "@nextui-org/react"
import { CONTRACT } from "../../secret.json"
import NFTMarket from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import { ethers } from 'ethers'
import Swal from 'sweetalert2'
import { useRouter } from 'next/router'


export default function OwnedSingleCard({ id }) {

    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)

    const [itemId, setItemId] = useState()
    const [itemName, setItemName] = useState()
    const [itemDescription, setItemDescription] = useState()
    const [itemUrl, setItemUrl] = useState()
    const [itemSale, setItemSale] = useState()
    const [priceValue, setPriceValues] = useState()

    const [visible, setVisible] = useState(false);
    const handler = () => setVisible(true);
    const closeHandler = () => {
        setVisible(false);
        console.log("closed");
    };

    async function getSingleItem() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, signer)
        let item = await contract.getSingleItem(id)
        setItemId(item[id].itemId)
        setItemDescription(item[id].description)
        setItemName(item[id].name)
        setItemUrl(item[id].tokenURI)
        setItemSale(item[id].forSale)
    }

    useEffect(() => {
        getSingleItem()
    }, [])

    async function resellNft() {
        setIsLoading(true)
        if (!(priceValue > 0)) {
            alert("please add price")
            setIsLoading(false)
            return
        }
        const price = ethers.utils.parseUnits(priceValue, 'ether')
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        let contract = new ethers.Contract(CONTRACT, NFTMarket.abi, signer)
        try {
            const tx = await contract.resellItem(itemId, price)
            setPriceValues(0)
            await tx.wait()
            closeHandler()
            Swal.fire({
                title: 'Success',
                html: `Transaction successfully <br><a href="https://testnet.aurorascan.dev/tx/${tx.hash}"><u>view on explorer</u></a> `,
                icon: 'Success',
                confirmButtonText: 'Done',
            }).then(() => {
                router.push('/')
            })
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
                    <Col>
                        <Text size={12} weight="bold" transform="uppercase" color="#9E9E9E">
                            {itemName}
                        </Text>
                        <Text size={12} p color="white">
                            {itemDescription}
                        </Text>
                    </Col>
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
                        position: "absolute",
                        bgBlur: "#0f1114",
                        borderTop: "$borderWeights$light solid $gray700",
                        bottom: 0,
                        zIndex: 1,
                    }}
                >
                    <Row>
                        <Col>
                            <Row justify="center">
                                {itemSale ?
                                    <Text
                                        css={{ color: "inherit" }}
                                        size={12}
                                        weight="bold"
                                        transform="uppercase"
                                    >
                                        Listed
                                    </Text>
                                    :
                                    <Button
                                        color="error"
                                        auto
                                        rounded
                                        onClick={handler}
                                    >
                                        <Text
                                            css={{ color: "inherit" }}
                                            size={12}
                                            weight="bold"
                                            transform="uppercase"
                                        >
                                            Resell
                                        </Text>
                                    </Button>
                                }

                            </Row>
                        </Col>
                    </Row>
                </Card.Footer>
            </Card>

            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        Resell NFT
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Input
                        clearable
                        inputted="numeric"
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        helperText="Enter new reselling price"
                        placeholder="New Price (ETH)"
                        onChange={e => setPriceValues(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onClick={closeHandler}>
                        Close
                    </Button>
                    {isLoading ?
                        <Button disabled>
                            <Loading color="currentColor" size="sm" />
                        </Button>
                        :
                        <Button auto color="success" onClick={resellNft}>
                            List
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    )
}
