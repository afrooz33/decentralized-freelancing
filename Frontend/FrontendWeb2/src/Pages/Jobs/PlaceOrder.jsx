import React, { useState } from 'react'

function PlaceOrder() {
    const [amount, setAmount] = useState(0);


    const orderHandle = (e) => {
        e.preventDefault();
        alert(`Order place successfully ${typeof(amount)}`);
        setAmount(0)
    }

  return (
    <div>
      <form onSubmit={orderHandle} className='placeOrder'>
        <h1>Place Order</h1>
        <input 
            type="number"
            min={1}
            placeholder='enter your dicussion amount in Wei'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
        />
        <button type='submit'>Submit</button>
      </form>
      <p>Amount type: {typeof(amount)}</p>
    </div>
  )
}

export default PlaceOrder
