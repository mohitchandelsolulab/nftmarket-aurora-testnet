import { Container } from "@nextui-org/react";
import Navigation from "../components/Navigation"
import NftGrid from "../components/NFT-Cards/NftGrid"

export default function Home() {
  return (
    <>
      <div>
        <Navigation />
      </div>
      <Container>
        <NftGrid />
      </Container>
    </>
  )
}
