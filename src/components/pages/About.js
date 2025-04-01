import React from 'react';

function About() {
  return (
    <div className="pyro-page about-page">
      <div className="page-header">
        <h1>About EasyWare</h1>
        <p>A simpler way to find PC hardware</p>
      </div>
      
      <div className="page-content">
        <section className="about-section">
          <h2>The Project</h2>
          <p>EasyWare is a school project designed to make PC building more accessible to everyone. 
             I wanted to create a tool that helps people compare prices and find compatible components 
             without needing to be tech experts.</p>
        </section>
        
        <section className="about-section">
          <h2>Why I Made This</h2>
          <p>As a student developer, I've experienced how overwhelming it can be to build a PC for the first time. 
             Searching through different websites for the best prices and trying to figure out if parts work together 
             isn't easy. EasyWare aims to solve that problem.</p>
        </section>
        
        <section className="about-section">
          <h2>The Goal</h2>
          <p>I created EasyWare to help users build computers intuitively without requiring any prior knowledge 
            of computer hardware. I believe everyone should be able to get a PC that meets their needs
            without having to learn all the technical jargon first.</p>
        </section>
        
        <section className="about-section">
          <h2>How It Works</h2>
          <p>The site pulls price information from various retailers and presents it in an easy-to-understand format.
             The compatibility checker helps ensure all your chosen parts will work together.</p>
          <p>In a real-world version, machine learning could be used to keep the database updated with new components
             as they're released, automatically understanding their specs and compatibility requirements.</p>
        </section>
        
        <section className="about-section">
          <h2>About Me</h2>
          <p>I'm a student with a passion for both web development and PC building. This project combines those interests
             while helping solve a real problem that many first-time PC builders face. As someone who's spent hours
             researching components and comparing prices, I wanted to create a tool I wish I had when starting out.</p>
        </section>
      </div>
    </div>
  );
}

export default About;