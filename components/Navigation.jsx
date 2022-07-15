import { useEffect } from "react"
import { ethers } from "ethers"
import { useState } from "react"
import { Button, Row, Text, Col, Grid, Image } from "@nextui-org/react"
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function Navigation() {

    const [address, setAddress] = useState()
    const [isConnected, setIsConnected] = useState(false)

    async function askToChangeNetwork() {
        if (window.ethereum) {
            const targetNetworkId = '0x1313161555';
            const chainId = 1313161555;
            if (window.ethereum.networkVersion != chainId) {
                Swal.fire({
                    title: 'Warning',
                    text: "This Dapp only runs on Aurora Testnet",
                    icon: 'warning',
                })
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: targetNetworkId }],
                    });
                } catch (error) {
                    if (error.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: targetNetworkId,
                                        rpcUrl: 'https://testnet.aurora.dev/',
                                    },
                                ],
                            });
                        } catch (addError) {
                            console.error(addError);
                        }
                    }
                    console.error(error);
                }
            }
        } else {
            alert('MetaMask is not installed');
        }
    }

    async function onChainChange() {
        if (window.ethereum) {
            await window.ethereum.on('chainChanged', chainId => {
                askToChangeNetwork()
                window.location.reload();
            })
        }
    }

    async function onAccountChange() {
        await window.ethereum.on('accountsChanged', function (accounts) {
            window.location.reload();
        });
    }

    async function checkForConnection() {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const accountAddress = await signer.getAddress()
        accountAddress ? setIsConnected(true) : setIsConnected(false)
    }

    useEffect(() => {
        onChainChange()
        askToChangeNetwork()
        onAccountChange()
        checkForConnection()
    }, [])

    async function connectWallet() {
        if (typeof window !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            await provider.send("eth_requestAccounts", [])
            const signer = provider.getSigner()
            const accountAddress = await signer.getAddress()
            setAddress(accountAddress)
            accountAddress ? setIsConnected(true) : setIsConnected(false)
        } else {
            alert("please Install metamask")
        }
    }


    return (
        <>
            <Row css={{ backgroundColor: "#220760", padding: "10px 0", marginBottom: "30px" }} justify="center" align="center">
                <Col span={1}>
                </Col>
                <Col span={3}>
                    <Text color="white" h2 size={15} css={{ m: 0 }}>
                        <Link color="white" href="/">NFTs</Link>
                    </Text>
                </Col>
                <Col span={8}>
                    <Grid.Container css={{ display: "flex", alignItems: "center" }} justify="center" alignContent="center">
                        <Grid xs={2}>
                            <Text color="white" h6 size={15} css={{ m: 0 }}>
                                <Link color="white" href="/">All NFT Items</Link>
                            </Text>
                        </Grid>
                        <Grid xs={2}>
                            <Text color="white" h6 size={15} css={{ m: 0 }}>
                                <Link color="white" href="/mynfts">Owned NFT's</Link>
                            </Text>
                        </Grid>
                        <Grid xs={2}>
                            <Text color="white" h6 size={15} css={{ m: 0 }}>
                                <Link color="white" href="/createitem">Create Item</Link>
                            </Text>
                        </Grid>
                        <Grid xs={2}>
                            {isConnected ?
                                <Button disabled>
                                    <Image
                                        width={20}
                                        src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"/>
                                    <Text>Connected</Text>
                                </Button>
                                :
                                <Button
                                    size={"sm"} color={"success"} onClick={connectWallet}>
                                    <Image
                                        width={20}
                                        src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png"/>
                                    <Text>Connect</Text>
                                </Button>
                            }
                        </Grid>
                    </Grid.Container>
                </Col>
            </Row>
        </>
    )
}
