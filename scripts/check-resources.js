const urls = [
  'http://localhost:3000/css/style.css',
  'http://localhost:3000/js/app.js',
  'http://localhost:3000/data/portfolio.json',
  'http://localhost:3000/assets/profile.jpeg',
  'http://localhost:8080/css/style.css',
  'http://localhost:8080/js/app.js',
  'http://localhost:8080/data/portfolio.json',
  'http://localhost:8080/assets/profile.jpeg',
  'http://localhost:8080/assets/aws%20hands-on.pdf'
];

(async ()=>{
  for(const u of urls){
    try{
      const res = await fetch(u, {method: 'HEAD'});
      console.log(`${u} -> ${res.status}`);
    }catch(e){
      console.log(`${u} -> ERROR: ${e.message}`);
    }
  }
})();
