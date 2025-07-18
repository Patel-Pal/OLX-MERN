

function Home() {
  const name = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  return (
    <div>
      <h1 className='text-center mt-5'>Welcome to OLX Clone</h1>
      <h3 className='text-center  font-bold'>name: {name}</h3>
      <h3 className='text-center  font-bold'>email: {email}</h3>
      <h3 className='text-center font-bold'>role: {role}</h3>
    </div>
  )
}

export default Home
