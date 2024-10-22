"use client"
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { FaWallet, FaSearch, FaUser, FaStar, FaFilter, FaBriefcase, FaGlobe, FaChartLine } from 'react-icons/fa';
import algosdk from 'algosdk';
import { NetworkId, useWallet } from '@txnlab/use-wallet-react';
import React from "react";
import Image from 'next/image';

const peraWallet = new PeraWalletConnect();

interface Freelancer {
  id: number;
  name: string;
  rate: number;
  image: string;
  description: string;
  expertise: string[];
  followers: number;
  rating: number;
}

export default function Home() {
  const {
    algodClient,
    activeAddress,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [freelancers] = useState<Freelancer[]>([
    { id: 1, name: "Alex Blockchain", rate: 5, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Blockchain expert and influencer", expertise: ["DeFi", "NFTs"], followers: 100000, rating: 4.8 },
    { id: 2, name: "Sophia Crypto", rate: 7, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Cryptocurrency analyst and educator", expertise: ["Trading", "Market analysis"], followers: 150000, rating: 4.9 },
    { id: 3, name: "Max Decentralized", rate: 6, image: "https://salmon-raw-harrier-526.mypinata.cloud/ipfs/QmPn1N246VyYCxTbpPV6q6RLq1q3dpoez8Ru4rL345UFAs", description: "Decentralized system architect", expertise: ["Smart contracts", "DAOs"], followers: 80000, rating: 4.7 },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts: string[]) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e: Error) => console.log(e));
  }, []);

  function handleConnectWalletClick() {
    wallets[0]
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0].address);
        setActiveNetwork(NetworkId.TESTNET);
        wallets[0].setActiveAccount(newAccounts[0].address)
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    wallets[0].disconnect();
    setAccountAddress(null);
  }

  async function handleHire(freelancer: Freelancer) {
    if (!accountAddress || !activeAddress) {
      alert('Please connect your wallet before hiring a Freelancer.');
      return;
    }

    try {
      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: suggestedParams,
        from: accountAddress,
        to: "DTUA424DKCJYPHF5MLO6CL4R2BWOTH2GLOUQA257K5I7G65ENHSDJ4TTTE",
        amount: freelancer.rate * 1000000,
      });
      
      atc.addTransaction({ txn: transaction, signer: transactionSigner })

      const result = await atc.execute(algodClient, 2)
      console.info(`Transaction successful!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs
      })
      alert('Freelancer hired successfully!')
    } catch (error) {
      console.error('Error during transaction:', error)
      alert('An error occurred while hiring a Freelancer. Please try again.')
    }
  }

  const filteredFreelancers = freelancers.filter(freelancer =>
    (freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterExpertise === "" || freelancer.expertise.includes(filterExpertise))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <header className="bg-purple-900 shadow-lg p-4 fixed w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FaGlobe className="mr-2" />
            FreelancerHire
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a Freelancer..."
                className="py-2 px-4 pr-10 rounded-full border border-purple-300 bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-indigo-400" />
            </div>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-full flex items-center hover:bg-purple-700 transition duration-300"
              onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}
            >
              <FaWallet className="mr-2" />
              {isConnectedToPeraWallet ? "Disconnect Wallet" : "Connect Pera Wallet"}
            </button>
            <FaUser className="text-2xl cursor-pointer text-indigo-600" />
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="bg-purple-800 text-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Find Top Blockchain Freelancers</h1>
            <p className="text-xl mb-8">Connect with the best blockchain experts for your project</p>
            <button className="bg-white text-purple-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-100 transition duration-300 shadow-lg flex items-center mx-auto">
              <FaBriefcase className="mr-2" />
              Get Started
            </button>
          </div>
        </section>

        <section className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-indigo-300">Top Blockchain Freelancers</h2>
            <div className="flex items-center space-x-4">
              <FaFilter className="text-indigo-400" />
              <select
                className="border border-indigo-300 rounded-md p-2 bg-purple-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
              >
                <option value="">All expertise</option>
                <option value="DeFi">DeFi</option>
                <option value="NFTs">NFTs</option>
                <option value="Trading">Trading</option>
                <option value="Smart contracts">Smart contracts</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="bg-purple-800 rounded-lg shadow-xl overflow-hidden border border-purple-600 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                <Image 
                  src={freelancer.image} 
                  alt={freelancer.name} 
                  width={300} 
                  height={300} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-xl text-white">{freelancer.name}</h3>
                    <div className="flex items-center bg-purple-700 px-2 py-1 rounded-full">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-bold text-white">{freelancer.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-purple-300 mb-2">Expertise: {freelancer.expertise.join(", ")}</p>
                  <p className="text-sm text-purple-300 mb-2">
                    <FaChartLine className="inline mr-1" />
                    Followers: {freelancer.followers.toLocaleString()}
                  </p>
                  <p className="text-white text-sm mb-4">{freelancer.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-400">{freelancer.rate} ALGO/hour</span>
                    <button
                      className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition duration-300 flex items-center"
                      onClick={() => handleHire(freelancer)}
                    >
                      <FaBriefcase className="mr-2" />
                      Hire Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-purple-900 text-white p-8 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About FreelancerHire</h3>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Support</h3>
            <ul className="space-y-2">
              <li>Help Center</li>
              <li>How to Buy</li>
              <li>Payment Methods</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Partners</h3>
            <ul className="space-y-2">
              <li>Terms of Service</li>
              <li>Sell with FreelancerHire</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
            <div className="flex space-x-4">
              {/* Add social media icons here */}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 FreelancerHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
