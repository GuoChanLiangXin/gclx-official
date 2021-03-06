import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import FileSaver from "file-saver";
import _ from "lodash";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";

import StyledToolTip from "./StyledToolTip";
import showMessage from "./showMessage";
import { padWidth } from "../utils";
import Container from "./Container";
import { TRAITS } from "./traits";

const Content = styled.div`
  max-width: 840px;
  margin: 5% auto 10% auto;
  strong {
    color: red;
  }
`;

const TraitItem = styled.div`
  width: ${(props) => {
    return props.width;
  }}px;
  cursor: pointer;
  margin: 5px;
  border: 1px solid
    ${(props) => {
      return props.selected ? "#000" : "#ccc";
    }};

  img {
    background: url("/traits/Lian.jpg") no-repeat;
    background-size: ${(props) => {
      return props.width;
    }}px;
    width: 100%;
    display: block;
  }
  div {
    font-size: 14px;
    padding: 2px 0;
    text-align: center;
    background: #eee;
    color: #000;
  }
`;

function PFPProperty(props) {
  return (
    <div
      style={{ float: "left" }}
      onClick={() => {
        props.onClick && props.onClick();
      }}
    >
      <StyledToolTip
        placement="right"
        title={
          <TraitItem width={150}>
            <img src={props.img} alt={props.name} />
            <div style={{ padding: "10px 0" }}>{props.name}</div>
          </TraitItem>
        }
      >
        <TraitItem selected={props.selected} width={62}>
          <img src={props.img} alt={props.name} />
          <div>{props.name}</div>
        </TraitItem>
      </StyledToolTip>
    </div>
  );
}

const TraitsWrapper = styled.div`
  display: flex;
`;
const TraitsList = styled.div`
  overflow: hidden;
  padding: 10px;
`;

function PFPRTraits(props) {
  const currentTraits = TRAITS[props.currentTab] || [];
  const currentTraitSelection = props.pfp[props.currentTab];

  return (
    <TraitsWrapper>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={props.currentTab}
        onChange={props.handleChange}
        sx={{ flex: "0 0 100px" }}
      >
        <Tab label="??????" value="Faxing" />
        <Tab label="??????" value="Yanjing" />
        <Tab label="??????" value="Bizi" />
        <Tab label="??????" value="Zuiba" />
        <Tab label="????????????" value="Mianbuzhuangshi" />
        <Tab label="????????????" value="Yanbuzhuangshi" />
      </Tabs>
      <TraitsList>
        {currentTraits.map((trait) => {
          const selected = currentTraitSelection === trait.key;
          return (
            <PFPProperty
              onClick={() => {
                props.onChange &&
                  props.onChange({
                    ...props.pfp,
                    [props.currentTab]: selected ? null : trait.key,
                  });
              }}
              name={trait.name}
              key={trait.key}
              img={trait.img}
              selected={selected}
            />
          );
        })}
      </TraitsList>
    </TraitsWrapper>
  );
}

const PFPAvatarWrapper = styled.div`
  background: #fff;
  width: 284px;
  height: 284px;
  border: 2px solid #ccc;
  position: relative;
  img {
    width: 280px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
`;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function isWeChat() {
  return /MicroMessenger/i.test(window.navigator.userAgent);
}

function PFPCanvas(props) {
  const canvasRef = useRef(null);
  // for stupid WeChat
  const [imgDataURI, setImgDataURI] = useState(null);
  const [enableJiguangyan, setEnableJiguangyan] = useState(false);

  useEffect(() => {
    (async () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 600, 600);
      ctx.beginPath();
      ctx.rect(0, 0, 600, 600);
      ctx.fillStyle = "#fff";
      ctx.fill();

      let images = ["/traits/Lian.jpg"];
      Object.keys(props.pfp).forEach((pfpKey) => {
        if (props.pfp[pfpKey]) {
          images.push(`/traits/${pfpKey}/${props.pfp[pfpKey]}.png`);
        }
      });

      // always move Faxing to the end
      images.push(
        images.splice(
          images.findIndex((img) => img.includes("Faxing")),
          1
        )[0]
      );

      // add ji guang yan
      if (enableJiguangyan) {
        images.push(`/traits/Jiguangyan/Jiguangyan.png`);
      }

      const imagesObj = await Promise.all(images.map(loadImage));

      imagesObj.forEach((image) => {
        ctx.drawImage(image, 0, 0);
      });

      setImgDataURI(canvas.toDataURL("image/png"));
    })();
  }, [props.pfp, enableJiguangyan]);

  return (
    <div>
      <PFPAvatarWrapper>
        <img src={imgDataURI} alt="" />
        <canvas
          style={{ display: "none" }}
          width="600"
          height="600"
          ref={canvasRef}
        />
      </PFPAvatarWrapper>
      <div style={{ display: "flex", alignItems: "center", padding: "5px 0" }}>
        <Checkbox
          size="small"
          checked={enableJiguangyan}
          onChange={(event) => {
            setEnableJiguangyan(event.target.checked);
          }}
        />
        <span>??????????????????</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          size="small"
          variant="contained"
          onClick={async () => {
            if (isWeChat()) {
              showMessage({
                title:
                  "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????",
              });
            } else {
              const canvas = canvasRef.current;
              canvas.toBlob((imageBlob) => {
                FileSaver.saveAs(imageBlob, "gclx.png");
              });
            }
          }}
        >
          ????????????
        </Button>
        <Tooltip
          title={
            <div
              style={{
                background: "#000",
                padding: "5px 10px",
                marginTop: 10,
              }}
            >
              ???????????????????????????????????????????????????
            </div>
          }
          placement="bottom"
        >
          <Button
            style={{ marginLeft: "auto", marginRight: 10 }}
            onClick={props.onRandom}
            size="small"
            variant="outlined"
          >
            ????????????
          </Button>
        </Tooltip>
        <Button onClick={props.onReset} size="small" variant="outlined">
          ??????
        </Button>
      </div>
    </div>
  );
}

function getRandomTraits() {
  let randomTraits = {};
  Object.keys(TRAITS).forEach((traitKey) => {
    randomTraits[traitKey] = _.sample(TRAITS[traitKey]).key;
  });

  const randomPercentage = Math.floor(Math.random() * 100);
  console.log("randomPercentage: ", randomPercentage);

  if (randomPercentage < 80) {
    randomTraits.Yanbuzhuangshi = null;
  }

  if (randomPercentage < 60) {
    randomTraits.Mianbuzhuangshi = null;
  }

  if (randomTraits["Mianbuzhuangshi"] === "Huzi") {
    randomTraits["Bizi"] = null;
    randomTraits["Zuiba"] = null;
  }
  if (randomTraits["Yanbuzhuangshi"] === "Mojing") {
    randomTraits["Yanjing"] = null;
  }

  console.log("randomTraits: ", randomTraits);

  return randomTraits;
}

const PFPMakerWrapper = styled.div`
  display: flex;
  @media only screen and (max-width: ${padWidth}) {
    flex-direction: column;
  }
`;
const PFPMakerLeft = styled.div`
  flex-basis: 50%;
  background: #fff;
  border: 2px solid #ccc;
  min-height: 504px;
  @media only screen and (max-width: ${padWidth}) {
    flex-basis: auto;
    min-height: auto;
    margin-bottom: 30px;
  }
`;
const PFPMakerRight = styled.div`
  display: flex;
  flex-basis: 50%;
  justify-content: center;
  align-items: center;
  @media only screen and (max-width: ${padWidth}) {
    flex-basis: auto;
  }
`;

function PFPTool() {
  const [currentTab, setCurrentTab] = useState("Faxing");
  const [pfp, setPfp] = useState({
    Yanjing: null,
    Bizi: null,
    Zuiba: null,
    Mianbuzhuangshi: null,
    Yanbuzhuangshi: null,
    Faxing: null,
  });

  return (
    <PFPMakerWrapper>
      <PFPMakerLeft>
        <PFPRTraits
          currentTab={currentTab}
          handleChange={(event, tab) => {
            setCurrentTab(tab);
          }}
          pfp={pfp}
          onChange={(newPfp) => {
            setPfp(newPfp);
          }}
        />
      </PFPMakerLeft>
      <PFPMakerRight>
        <PFPCanvas
          onRandom={() => {
            setPfp(getRandomTraits());
          }}
          onReset={() => {
            setPfp({
              Yanjing: null,
              Bizi: null,
              Zuiba: null,
              Mianbuzhuangshi: null,
              Yanbuzhuangshi: null,
              Faxing: null,
            });
          }}
          pfp={pfp}
        ></PFPCanvas>
      </PFPMakerRight>
    </PFPMakerWrapper>
  );
}

function PFPMaker() {
  return (
    <Container
      style={{
        background: "#dae7f8",
      }}
      id="pfpmaker"
    >
      <Typography
        style={{ textAlign: "center", marginTop: "5%" }}
        variant="h3"
        gutterBottom
        component="div"
      >
        ???????????????????????????
      </Typography>

      <Content style={{ padding: "5px" }}>
        <Typography variant="body2" style={{ marginBottom: 20 }}>
          ????????????????????? 1000
          ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </Typography>
        <Typography variant="body2" style={{ marginBottom: 30 }}>
          ????????????????????????????????? NFT???
          <strong>
            ?????????????????????????????????????????????????????????????????????????????????
          </strong>
          ?????????????????????????????? ??????????????????????????????????????????
          NFT????????????????????????????????????????????????????????????????????????????????????
        </Typography>
        <div>
          <PFPTool />
        </div>
      </Content>
    </Container>
  );
}

export default PFPMaker;
