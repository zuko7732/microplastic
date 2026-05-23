function Home({ categories, setCategory }) {
  return (
    <div className="page home">
      <h1>Microplastics Research</h1>

      <div className="cards">
        {categories.map((item) => (
          <div
            className="card main"
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;