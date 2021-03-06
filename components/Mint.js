import { useState, useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";
import { throttle } from "lodash";

import { get, subscribe } from "../store";
import Container from "./Container";
import ConnectWallet, { connectWallet } from "./ConnectWallet";
import showMessage from "./showMessage";

const ETHERSCAN_DOMAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "etherscan.io"
    : "rinkeby.etherscan.io";

const Content = styled.div`
  max-width: 840px;
  margin: 0 auto 5% auto;
  strong {
    color: red;
  }
`;

const StyledMintButton = styled.div`
  display: inline-block;
  width: 140px;
  text-align: center;
  padding: 10px 10px;
  border: 4px solid #000;
  border-radius: 20px;
  color: #000;
  background: #dde4b6;
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.6 : 1;
  }};
`;

function MintButton(props) {
  const [minting, setMinting] = useState(false);

  return (
    <StyledMintButton
      disabled={!!props.disabled}
      minting={minting}
      onClick={async () => {
        if (minting || props.disabled) {
          return;
        }
        setMinting(true);
        try {
          const { signer, contract } = await connectWallet();
          const contractWithSigner = contract.connect(signer);
          const value = ethers.utils.parseEther(
            props.mintAmount === 1 ? "0.01" : "0.02"
          );
          const tx = await contractWithSigner.mint(props.mintAmount, {
            value,
          });
          const response = await tx.wait();
          showMessage({
            type: "success",
            title: "ιΈι ζε",
            body: (
              <div>
                <a
                  href={`https://${ETHERSCAN_DOMAIN}/tx/${response.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ηΉε»ζ₯ηδΊ€ζθ―¦ζ
                </a>{" "}
                ζθε°{" "}
                <a
                  href="https://opensea.io/account"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenSea ζ₯η
                </a>
                γ
              </div>
            ),
          });
        } catch (err) {
          showMessage({
            type: "error",
            title: "ιΈι ε€±θ΄₯",
            body: err.message,
          });
        }
        props.onMinted && props.onMinted();
        setMinting(false);
      }}
      style={{
        background: "#dde4b6",
        ...props.style,
      }}
    >
      ιΈι  {props.mintAmount} δΈͺ{minting ? "δΈ­..." : ""}
    </StyledMintButton>
  );
}

function MintSection() {
  const [status, setStatus] = useState("0");
  const [progress, setProgress] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [numberMinted, setNumberMinted] = useState(0);

  async function updateStatus() {
    const { contract } = await connectWallet();
    const status = await contract.status();
    const progress = parseInt(await contract.totalSupply());
    setStatus(status.toString());
    setProgress(progress);
    // ε¨ mint δΊδ»ΆηζΆεζ΄ζ°ζ°ζ?
    const onMint = throttle(async () => {
      const status = await contract.status();
      const progress = parseInt(await contract.totalSupply());
      setStatus(status.toString());
      setProgress(progress);
    }, 1000 - 233);
    contract.on("Minted", onMint);
  }

  useEffect(() => {
    (async () => {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        const { contract } = await connectWallet();
        const numberMinted = await contract.numberMinted(fullAddressInStore);
        setNumberMinted(parseInt(numberMinted));
        setFullAddress(fullAddressInStore);
      }
      subscribe("fullAddress", async () => {
        const fullAddressInStore = get("fullAddress") || null;
        setFullAddress(fullAddressInStore);
        if (fullAddressInStore) {
          const { contract } = await connectWallet();
          const numberMinted = await contract.numberMinted(fullAddressInStore);
          setNumberMinted(parseInt(numberMinted));
          updateStatus();
        }
      });
    })();
  }, []);

  useEffect(() => {
    try {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        updateStatus();
      }
    } catch (err) {
      showMessage({
        type: "error",
        title: "θ·εεηΊ¦ηΆζε€±θ΄₯",
        body: err.message,
      });
    }
  }, []);

  async function refreshStatus() {
    const { contract } = await connectWallet();
    const numberMinted = await contract.numberMinted(fullAddress);
    setNumberMinted(parseInt(numberMinted));
  }

  let mintButton = (
    <StyledMintButton
      style={{
        background: "#eee",
        color: "#999",
        cursor: "not-allowed",
      }}
    >
      ε°ζͺεΌε§
    </StyledMintButton>
  );

  if (status === "1") {
    mintButton = (
      <div
        style={{
          display: "flex",
        }}
      >
        <MintButton
          onMinted={refreshStatus}
          mintAmount={1}
          style={{ marginRight: "20px" }}
        />
        <MintButton
          onMinted={refreshStatus}
          mintAmount={2}
          disabled={numberMinted === 1}
        />
      </div>
    );
  }

  if (progress >= 1000 || status === "2") {
    mintButton = (
      <StyledMintButton
        style={{
          background: "#eee",
          color: "#999",
          cursor: "not-allowed",
        }}
      >
        ε¨ι¨εε?δΊ
      </StyledMintButton>
    );
  }

  if (numberMinted === 2) {
    mintButton = (
      <StyledMintButton
        style={{
          background: "#eee",
          color: "#999",
          cursor: "not-allowed",
        }}
      >
        ιΈι ε·²θΎΎδΈι
      </StyledMintButton>
    );
  }

  if (!fullAddress) {
    mintButton = (
      <StyledMintButton
        style={{
          background: "#eee",
          color: "#999",
          cursor: "not-allowed",
        }}
      >
        θ―·εθΏζ₯ι±ε
      </StyledMintButton>
    );
  }

  mintButton = (
    <StyledMintButton
      style={{
        background: "#eee",
        color: "#999",
        cursor: "not-allowed",
      }}
    >
      ε¨ι¨εε?δΊ
    </StyledMintButton>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        ζ¨ηι±εοΌ <ConnectWallet />{" "}
        {fullAddress && (
          <span style={{ marginLeft: 10 }}>
            ε―δ»₯ιΈι  {2 - numberMinted} δΈͺγ
          </span>
        )}
      </div>
      {mintButton}
      <div style={{ marginTop: 10 }}>
        θ―·η§»ζ­₯ε¨{" "}
        <a
          href="https://opensea.io/collection/gclx"
          target="_blank"
          rel="noreferrer"
        >
          OpenSea
        </a>{" "}
        δΈζ₯ηγ
      </div>
      <div style={{ marginTop: 20, fontSize: 20, textAlign: "center" }}>
        ιΈι θΏεΊ¦οΌ{progress === null ? "θ―·εθΏζ₯ι±ε" : progress} / 1000οΌδ»·ζ Ό
        0.01 ETH δΈδΈͺοΌζ―δΈͺι±εζε€ 2 δΈͺοΌζ―δΊΊζ―ε€© 2 δΈͺι±εγ
        <br />
        δ»ε€©οΌζδ»¬ι½ζ―θ―εΏιΈι δΊΊοΌ
      </div>
    </div>
  );
}

function Mint() {
  return (
    <Container
      style={{
        background: "#5383b2",
        color: "#fff",
      }}
      id="mint"
    >
      <Typography
        style={{ textAlign: "center", marginTop: "5%" }}
        variant="h3"
        gutterBottom
        component="div"
      >
        ιΈι οΌMintοΌ
      </Typography>

      <Content>
        <Typography
          style={{
            marginTop: "5%",
            textAlign: "center",
          }}
          variant="body1"
          gutterBottom
        >
          ζ¨ε₯½ζηζεοΌζζ²‘ζθ§εΎθΏδΈͺε½δΊ§θ―εΏ NFT
          ι‘Ήη?η½η«θ·ε«ηι‘Ήη?δΈε€ͺδΈζ ·οΌδΈι’εΊθ―ηΉε«ε€οΌMint
          ηζι?εζΉζ³δΈη΄ζΎδΈε°οΌ
        </Typography>
        <Typography
          style={{
            marginTop: 30,
            textAlign: "center",
          }}
          variant="body1"
          gutterBottom
        >
          θΏεΉΆιε δΈΊζδ»¬δΈζη¨ζ·δ½ιͺοΌηΈεοΌζδ»¬εΈζζ¨ε¨εδΈδ»»δ½δΈδΈͺι‘Ήη?ηζΆεοΌι½θ½θ?€ηη η©Άι‘Ήη?θεηε’ιγηεΏ΅γεε±θ·―ηΊΏει£ι©γδΈθ¦
          FOMO δΉδΈθ¦ FUDοΌθ¦ηζ§ηε³ε?θͺε·±ζ―ε¦θ¦εδΈθΏδΈͺι‘Ήη?οΌ
        </Typography>
        <Typography
          style={{
            marginTop: 30,
            textAlign: "center",
          }}
          variant="body1"
          gutterBottom
        >
          ηΈδΏ‘ιθΏδΈι’ηθ΅ζοΌηΈδΏ‘ζ¨ε·²η»εεδΊθ§£δΊζδ»¬ε½δΊ§θ―εΏ NFT
          ι‘Ήη?γε¨ζ¨εε₯½εεηζζ³εε€δΉεοΌε―δ»₯ιζ©ηΉε»δΈι’ιΈι οΌMintοΌζι?θΏθ‘ιΈι γ
        </Typography>

        <div
          style={{
            marginTop: 60,
            border: "4px dashed #000",
            padding: "40px",
            borderRadius: 20,
          }}
        >
          <MintSection />
        </div>
        <Typography
          style={{ textAlign: "center", marginTop: "8%" }}
          variant="h5"
          gutterBottom
          component="div"
        >
          ιΈι δΉε
        </Typography>
        <Typography
          style={{
            marginTop: 30,
            textAlign: "center",
          }}
          variant="body2"
          gutterBottom
        >
          ιΈι ζεδΉεοΌζ¨ε―δ»₯ιζ©ε ε₯ε½δΊ§θ―εΏ NFT
          δΌει’ιοΌδΈθΏι‘Ήη?ε’ιδΈδΌε¨ιι’εη?‘ηζθη»η»δ»δΉδΊζγ
          <br />
          δΈΊδΊθηΊ¦ζΆι΄οΌη»θΏε NextDAO ηζ²ιοΌζδ»¬ε°δΌει’ιθ?Ύη«ε¨δΊ NextDAO η
          Discord ιι’γ
          <br />
          ζ¨ε―δ»₯ε ε₯ NextDAO η Discord οΌ
          <a
            style={{ color: "#fff" }}
            href="https://discord.gg/NextDAO"
            target="_blank"
            rel="noreferrer"
          >
            https://discord.gg/NextDAO
          </a>
          οΌ εΉΆιΎζ₯ι±ειͺθ―θΊ«δ»½οΌδΉεε³ε―ηε°δΌει’ιγ
        </Typography>
      </Content>
    </Container>
  );
}

export default Mint;
