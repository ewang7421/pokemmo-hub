import { Link } from "gatsby";
import React, { useEffect, useState } from "react";
import { Placeholder, Stack } from "react-bootstrap";
import { isMobile } from "react-device-detect";
import { TbPencil, TbTrash, TbPlus } from "react-icons/tb";
import {
  Td as SrTd,
  Tr as SrTr,
  Thead,
  Tbody,
  Th,
} from "react-super-responsive-table";
import { useMarket } from "../../context/MarketContext";
import { useTranslations } from "../../context/TranslationsContext";
import { prices } from "../../utils/prices";
import { Button, Typography, Table } from "../Atoms";
import { ItemImage } from "../Items/ItemImage";
import { ItemPrices } from "../Items/ItemPrices";
import { Accordion } from "react-bootstrap";

export const InvestmentItem = ({ investment, onPriceUpdate }) => {
  const { language } = useTranslations();
  const [currentPrice, setCurrentPrice] = useState({
    min: 0,
    change: 0,
    isLoading: true,
  });
  const [showEntries, setShowEntries] = useState(false);
  const { toggleInvestmentsModal, removeFromInvestments, allItems } =
    useMarket();
  const { n, _id, slug, category } = allItems.find(
    ({ i }) => i === investment.i
  );

  const boughtTotal = investment.entries.reduce(
    (total, currentEntry) =>
      total + currentEntry.boughtPrice * currentEntry.quantity,
    0
  );
  const boughtQuantity = investment.entries.reduce(
    (total, currentEntry) => total + currentEntry.quantity,
    0
  );
  const avgBoughtPrice = boughtTotal / boughtQuantity;

  const sellTotal = currentPrice.min * boughtQuantity; //prices.calculateSellGain(currentPrice.min) for listing fee deduction
  const gainTotal = sellTotal - boughtTotal;
  const gainPercent = (gainTotal / boughtTotal) * 100;

  useEffect(() => {
    if (currentPrice.isLoading) return;
    onPriceUpdate(investment.id, gainTotal, boughtTotal);
  }, [currentPrice, gainTotal, boughtTotal]);

  const Tr = isMobile ? SrTr : "tr";
  const Td = isMobile ? SrTd : "td";

  return (
    <>
      <Tr>
        <Td className="border-0">
          <Button
            onClick={() => {
              setShowEntries(!showEntries);
            }}
          >
            toggle
          </Button>
        </Td>
        <Td
          component="th"
          scope="row"
          className="d-flex align-items-start border-0"
        >
          <ItemImage className="me-1" category={category} id={_id} />
          &nbsp;
          <Typography
            as={Link}
            to={`/items/${slug}`}
            style={{ color: "var(--bs-info)" }}
          >
            {n[language]}
          </Typography>
        </Td>
        <Td align="right" className=" border-0">
          <ItemPrices onPriceUpdate={setCurrentPrice} i={investment.i} />
        </Td>
        <Td align="right" className=" border-0">
          {boughtQuantity}
        </Td>
        <Td align="right" className=" border-0">
          {prices.format(avgBoughtPrice)}
        </Td>
        <Td align="right" className=" border-0">
          {prices.format(parseInt(boughtTotal))}
        </Td>
        <Td align="right" className=" border-0">
          {currentPrice.isLoading ? (
            <Placeholder as="p" animation="glow" className="w-100 mb-0">
              <Placeholder xs={12}></Placeholder>
            </Placeholder>
          ) : (
            <span
              className={`mb-0 ${
                gainTotal > 0 ? "text-success" : "text-danger"
              }`}
            >
              {prices.format(parseInt(gainTotal))}
            </span>
          )}
        </Td>
        <Td align="right" className=" border-0">
          {currentPrice.isLoading ? (
            <Placeholder as="p" animation="glow" className="w-100 mb-0">
              <Placeholder xs={12}></Placeholder>
            </Placeholder>
          ) : (
            <span
              className={`mb-0 ${
                gainPercent > 0 ? "text-success" : "text-danger"
              }`}
            >
              {prices.format(parseFloat(gainPercent.toFixed(1))) + "%"}
            </span>
          )}
        </Td>
        <Td align="right" className=" border-0">
          <Button
            variant="success"
            className="d-flex justify-content-center"
            onClick={() => toggleInvestmentsModal(investment.i)}
          >
            <TbPlus />
          </Button>
        </Td>
      </Tr>
      {investment.entries.map((entry) => {
        const entryBoughtTotal = entry.quantity * entry.boughtPrice;
        const entrySellTotal = entry.quantity * currentPrice.min;

        const entryGainTotal = entrySellTotal - entryBoughtTotal;
        const entrygainPercent = (entryGainTotal / entryBoughtTotal) * 100;
        return (
          <Tr className={showEntries ? "" : "d-none"}>
            <Td className="border-0"></Td>
            <Td
              component="th"
              scope="row"
              className="d-flex align-items-start border-0"
            ></Td>
            <Td align="right" className=" border-0"></Td>
            <Td align="right" className=" border-0">
              {entry.quantity}
            </Td>
            <Td align="right" className=" border-0">
              {prices.format(entry.boughtPrice)}
            </Td>
            <Td align="right" className=" border-0">
              {prices.format(parseInt(entryBoughtTotal))}
            </Td>
            <Td align="right" className=" border-0">
              {currentPrice.isLoading ? (
                <Placeholder as="p" animation="glow" className="w-100 mb-0">
                  <Placeholder xs={12}></Placeholder>
                </Placeholder>
              ) : (
                <span
                  className={`mb-0 ${
                    entryGainTotal > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {prices.format(parseInt(entryGainTotal))}
                </span>
              )}
            </Td>
            <Td align="right" className=" border-0">
              {currentPrice.isLoading ? (
                <Placeholder as="p" animation="glow" className="w-100 mb-0">
                  <Placeholder xs={12}></Placeholder>
                </Placeholder>
              ) : (
                <span
                  className={`mb-0 ${
                    entrygainPercent > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {prices.format(parseFloat(entrygainPercent.toFixed(1))) + "%"}
                </span>
              )}
            </Td>
            <Td align="right" className=" border-0">
              <Stack
                direction="horizontal"
                gap={1}
                className="justify-content-end"
              >
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() =>
                    toggleInvestmentsModal(false, {
                      i: investment.i,
                      ...entry,
                    })
                  }
                >
                  <TbPencil />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => removeFromInvestments(investment.i, entry.id)}
                >
                  <TbTrash />
                </Button>
              </Stack>
            </Td>
          </Tr>
        );
      })}
    </>
  );
};
