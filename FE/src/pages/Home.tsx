

function Home() {
  // const name = sessionStorage.getItem('username');
  // const email = sessionStorage.getItem('email');
  const role = sessionStorage.getItem('role');

  return (
    <>

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 px-4 py-10">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">Welcome to OLX </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10">
          Buy, Sell & Explore the best deals in your city.
        </p>

        {role ? (
          <>
            {role === 'admin' && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-purple-700">Admin Dashboard</h2>
                <p className="text-gray-600">Manage users, products, and view platform statistics.</p>
              </div>
            )}

            {role === 'buyer' && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-green-700">Hello Buyer 👋</h2>
                <p className="text-gray-600">Browse products and track your orders.</p>
              </div>
            )}

            {role === 'seller' && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-blue-700">Welcome Seller 🛍️</h2>
                <p className="text-gray-600">List your products and manage your sales efficiently.</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Join Us Today</h2>
            <p className="text-gray-600">Login or Register to start buying and selling.</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-indigo-600">Secure Deals</h3>
            <p className="text-sm text-gray-500 mt-2">Buy & sell confidently with verified users.</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-green-600">Easy Navigation</h3>
            <p className="text-sm text-gray-500 mt-2">Find your product quickly using smart filters.</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold text-blue-600">24/7 Support</h3>
            <p className="text-sm text-gray-500 mt-2">We're here to help you at every step.</p>
          </div>
        </div>
      </div>
    </div>


    {/* <div>
      <h1 className='text-center mt-5'>Welcome to OLX Clone</h1>
      <h3 className='text-center  font-bold'>name: {name}</h3>
      <h3 className='text-center  font-bold'>email: {email}</h3>
      <h3 className='text-center font-bold'>role: {role}</h3>
    </div> */}

    </>
  )
}

export default Home
