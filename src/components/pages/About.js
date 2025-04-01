import React from 'react';

function About() {
  return (
    <div className="pyro-page about-page">
      <div className="page-header">
        <h1>About EasyWare</h1>
        <p>Your trusted companion for PC hardware shopping</p>
      </div>
      
      <div className="page-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>At EasyWare, we're dedicated to making PC hardware shopping simple and transparent. 
             We provide reliable price comparisons and help you build the perfect PC for your needs.</p>
        </section>
        
        <section className="about-section">
          <h2>Our Story</h2>
          <p>Founded in 2023, EasyWare was born from the frustration of searching through dozens of retailers 
             to find the best price for computer components. We've built a platform that does the hard work for you.</p>
        </section>
      </div>
    </div>
  );
}

export default About;