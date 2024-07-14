import axios from 'axios'
import React, { useEffect, useState } from 'react'
import ChartComponent from '../Chart/Chart.jsx'
export default function Home() {
  let [customers, setCustomers] = useState([])
  let [transactions, setTransactions] = useState([])
  let [data, setData] = useState([])
  let [nameFilter, setNameFilter] = useState('')
  let [amountFilter, setAmountFilter] = useState('')
  let [aggregatedData, setAggregatedData] = useState([])

  async function getData() {
    try {
      let dataOfCustomers = await axios.get("https://ammar-motaz2001.github.io/customerapi/customer.json")
      setCustomers(dataOfCustomers.data)
      console.log(dataOfCustomers.data)
      
      let dataOfTransactions = await axios.get("https://ammar-motaz2001.github.io/transactionsapi/transaction.json")
      setTransactions(dataOfTransactions.data)
      console.log(dataOfTransactions.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    let filteredData = customers.map((customer) => {
      let customerTransactions = transactions.filter(transaction => transaction.customer_id == customer.id)
      
      let totalAmount = customerTransactions.reduce((acc, trans) => acc + parseFloat(trans.amount), 0)
      
      return {
        ...customer,
        transactions: customerTransactions,
        totalAmount
      }
    })
    
    if (nameFilter) {
      filteredData = filteredData.filter(customer => customer.name.toLowerCase().includes(nameFilter.toLowerCase()))
    }

    if (amountFilter) {
      filteredData = filteredData.filter(customer => customer.transactions.some(transaction => transaction.amount.toString().includes(amountFilter)))
    }

    setData(filteredData)
  }, [customers, transactions, nameFilter, amountFilter])

  useEffect(() => {
    let dateAggregatedData = transactions.reduce((acc, trans) => {
      const date = trans.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(trans.amount);
      return acc;
    }, {});

    let aggregatedArray = Object.keys(dateAggregatedData).map(date => ({
      date,
      totalAmount: dateAggregatedData[date]
    }));

    setAggregatedData(aggregatedArray);
  }, [transactions]);

  return (
    <div className="container">
      <div className="filters">
        <input type="text" className='form-control my-3' placeholder="Filter by name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
        <input type="text" className='form-control my-3' placeholder="Filter by amount" value={amountFilter}  onChange={e => setAmountFilter(e.target.value)}  />
      </div>
      <table className='table table_striped text-center fst-italic'>
        <thead className='active table-dark' >
          <tr >
            <th>ID</th>
            <th>Name</th>
            <th>Transaction Date</th>
            <th>Transaction Amount</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((customer) => (
            <>
              {customer.transactions.map((trans, index) => (
                <tr key={`${customer.id}-${index}`}>
                  {index === 0 && (
                    <>
                      <td rowSpan={customer.transactions.length}>{customer.id}</td>
                      <td rowSpan={customer.transactions.length}>{customer.name}</td>
                    </>
                  )}
                  <td>{trans.date}</td>
                  <td>{trans.amount}</td>
                  {index === 0 && (
                    <td rowSpan={customer.transactions.length}>{customer.totalAmount}</td>
                  )}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
      <ChartComponent data={aggregatedData} />
    </div>
  )
}
