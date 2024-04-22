import { graphql, StaticQuery } from "gatsby";
import React, { createContext, useContext, useState } from "react";
import { Modal } from "../components/Atoms";
import { MarketAddInvestment } from "../components/Market/MarketAddInvestment";
import { throwConfetti } from "../utils/confetti";
import { useAccount } from "./AccountContext";
import { useNotification } from "./NotificationContext";

const MarketContext = createContext({
  investments: [],
  wishlist: [],
  allItems: [],
  toggleWishlist: (i) => null,
  toggleInvestmentsModal: () => null,
  addToInvestments: () => null,
  removeFromInvestments: () => null,
});

export function useMarket() {
  return useContext(MarketContext);
}

export function MarketProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newInvestmentId, setNewInvestmentId] = useState(0);
  const [editInvestment, setEditInvestment] = useState(false);
  const { showNotification } = useNotification();

  const { account, updateAccount } = useAccount();
  const { market } = account;

  const resetInvestment = () => {
    setEditInvestment(false);
    setNewInvestmentId(0);
  };

  const addToWishlist = (i) => {
    updateAccount({
      market: {
        ...market,
        wishlist: [...market.wishlist, i],
      },
    });
  };

  const removeFromWishlist = (i) => {
    updateAccount({
      market: {
        ...market,
        wishlist: market.wishlist.filter((_i) => _i !== i),
      },
    });
  };

  const toggleWishlist = (i) => {
    if (market.wishlist.includes(i)) return removeFromWishlist(i);

    return addToWishlist(i);
  };

  const toggleInvestmentsModal = (i = 0, investment = false) => {
    setIsOpen((prev) => !prev);
    if (i) setNewInvestmentId(i);

    if (investment) setEditInvestment(investment);
  };
  /** 

  let abcd = {investments: itemInvestment[]}
  let itemInvestment = {i: 1012, entries: investmentEntry[]}
  let investmentEntry = {id: "hash", boughtPrice: 1000, quantity: 200}
   */

  const addToInvestments = (newInvestment) => {
    console.log("old: " + JSON.stringify(market.investments));
    const { id, boughtPrice, quantity } = newInvestment;
    const newInvestmentEntry = { id, boughtPrice, quantity };

    let updatedInvestments = market.investments;
    const existingInvestmentIndex = updatedInvestments.findIndex(
      (existingInvestment) => existingInvestment.i === newInvestment.i
    );
    if (existingInvestmentIndex === -1) {
      updatedInvestments = [
        ...updatedInvestments,
        {
          i: newInvestment.i,
          entries: [newInvestmentEntry],
        },
      ];
    }
    if (existingInvestmentIndex !== -1) {
      const existingInvestment = updatedInvestments[existingInvestmentIndex];
      updatedInvestments = [
        ...updatedInvestments.slice(0, existingInvestmentIndex),
        {
          i: newInvestment.i,
          entries: [...existingInvestment.entries, newInvestmentEntry],
        },
        ...updatedInvestments.slice(existingInvestmentIndex + 1),
      ];
    }
    updateAccount({
      market: {
        ...market,
        investments: updatedInvestments,
      },
    });

    console.log("new: " + JSON.stringify(market.investments));
    throwConfetti(2);
    showNotification("Investment created! View it at the investments page.");
    resetInvestment();
  };

  const handleEditInvestment = (investment) => {
    updateAccount({
      market: {
        ...market,
        investments: market.investments.map((item) =>
          item.id === investment.id ? investment : item
        ),
      },
    });
    resetInvestment();
  };

  const removeFromInvestments = (id) => {
    updateAccount({
      market: {
        ...market,
        investments: market.investments.filter(
          (investment) => investment.id !== id
        ),
      },
    });
  };

  return (
    <StaticQuery
      query={graphql`
        query InvestmentItemQuery {
          allPokemmo {
            nodes {
              i
              n {
                en
                cn
                tw
                de
                fr
                it
                es
              }
              slug
              _id
              category
            }
          }
        }
      `}
      render={({ allPokemmo }) => (
        <MarketContext.Provider
          value={{
            allItems: allPokemmo.nodes,
            wishlist: market.wishlist,
            toggleWishlist,
            investments: market.investments,
            toggleInvestmentsModal,
            addToInvestments,
            removeFromInvestments,
            handleEditInvestment,
          }}
        >
          <Modal
            show={isOpen}
            title="Add investment"
            onHide={toggleInvestmentsModal}
          >
            <MarketAddInvestment
              isOpen={isOpen}
              i={newInvestmentId}
              onSave={(investment) => {
                addToInvestments(investment);
                toggleInvestmentsModal();
              }}
              onUpdate={(investment) => {
                handleEditInvestment(investment);
                toggleInvestmentsModal();
              }}
              updateInvestment={editInvestment}
            />
          </Modal>
          {children}
        </MarketContext.Provider>
      )}
    ></StaticQuery>
  );
}
