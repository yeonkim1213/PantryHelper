import React from 'react';
import { Link } from 'react-router-dom';
import './Team.css';

const teamMembers = [
  {
    name: 'Seojun Chung',
    degree: 'BS in Computer Science',
    bio: `   Hi, My name is Seojun Chung and I am a dedicated and passionate computer science student at the University of Utah, set to graduate in December 2024 with a Bachelor of Science degree in Computer Science. Throughout my academic and professional journey, I have immersed myself in diverse and impactful projects that have honed my skills and deepened my passion for technology.

    During my tenure as a Full Stack Intern at iLumens LLC, a subsidiary of InnoSys, I developed and managed cloud-based IoT applications, handling data streams from over 300 IoT devices. I also played a key role in creating real-time data visualization tools, which significantly improved operational efficiency. Additionally, I worked as an Android Developer at Dasoni Co., Ltd., where I developed Musicmate, an app designed to help individuals with intellectual disabilities discover and enhance their musical talents.
    
    For my capstone project, Pantry Helper, I am building a smart inventory system for the University of Utah's Feed U Pantry, integrating ReactJS, NodeJS, and AWS to streamline inventory management and reduce food waste.`,
    email: 'seojungood@gmail.com',
    linkedin: 'https://www.linkedin.com/in/seojun-chung-aa3067252/',
    image: '/team_image/seojun.jpg'
  },
  {
    name: 'Yeonjae (Jay) Kim',
    degree: 'BS in Computer Science',
    bio: `   Hi! My name is Jay Kim, and I'm a senior majoring in Computer Science at the University of Utah. I've worked on various projects focused on full-stack development, building scalable and user-friendly applications. For the Pantry Helper project, I contributed as a full-stack developer. My primary focus was implementing features that allow pantry staff to view donation items and financial reports, as well as showcasing pantry events for recipients. I also developed a request feature that enables recipients to request the items they need, improving accessibility and convenience.
    
    Beyond web development, I have experience with mobile app development. I created PotPal, a cooking tool-sharing app for a non-profit organization, as a full-stack developer. This project earned me the Best Mobile App award and a $1,000 prize for its innovative approach and usability. Additionally, I demonstrated my data analysis skills by winning 1st place in Layton hackathon. There, I analyzed employee data and developed an HR dashboard to identify turnover causes and headcount trends, showcasing my ability to leverage technology to solve real-world problems.
    
    I'm proficient in a wide range of technologies and passionate about developing intuitive and impactful software. My goal is to continue building innovative solutions that deliver tangible value to users.`,
    email: 'yeonjae.kim.jay@gmail.com',
    linkedin: 'https://www.linkedin.com/in/ye0njaekim',
    image: '/team_image/yeonjae.jpg'
  },
  {
    name: 'Yohan Kwak',
    degree: 'BS in Computer Science',
    bio: `   I am a senior pursuing a Bachelor of Science in Computer Science with a strong academic foundation in software engineering, algorithms, web development, database management, and data analysis. Through my coursework, I have developed skills in creating efficient systems, solving complex problems, and building user-focused applications.

    For my capstone project, I collaborated with a team to develop Pantry Helper, a web-based application designed to streamline pantry management for individuals and organizations. Working as part of a team allowed me to strengthen my communication and collaboration skills while contributing to key aspects of the project, including full-stack development, database integration, and algorithm optimization.
    
    Outside of academics, I enjoy watching movies and hiking. Movies inspire creative thinking, while hiking provides an opportunity to challenge myself and stay grounded.`,
    email: 'yohankwak97@gmail.com',
    linkedin: 'https://www.linkedin.com/in/yohan-kwak/',
    image: '/team_image/yohan.jpg'
  },

  {
    name: 'Matthew Rogers',
    degree: 'BS in Computer Science',
    bio: `   Hi, my name is Matthew Rogers. I am currently in the process of earning a bachelor's degree in computer science here at the University of Utah. I am also earning a minor in mathematics, a subject that I am quite passionate about. Throughout my academic carrer, I have always strived to further both my understanding of theory and my practical development skills.
  
    For my senior capstone project, I am part of the team which developed Pantry Helper. The experience of working on this project helped me to further develop both my programming and collaboration skills. It was very valuable as I was able to gain experience in new areas of software development.
    
    In my free time, I enjoy reading and spending time with my pet bird. I'm always excited and enthusiastic to work on whatever project comes next!`,
    email: 'matthewjrogers2000@gmail.com',
    image: '/team_image/matthew.jpg'
  }
];

const Team = () => {
  return (
    <div className="member-container">
      <div id="team-header">
        <div id="team-nav-buttons">
          <Link to="/about" id="team-nav-button" className={window.location.pathname === '/about' ? 'active' : ''}>
            About
          </Link>
          <Link to="/team" id="team-nav-button" className={window.location.pathname === '/team' ? 'active' : ''}>
            Meet the Team
          </Link>
          <Link to="/tutorial" id="team-nav-button" className={window.location.pathname === '/tutorial' ? 'active' : ''}>
            Tutorial
          </Link>
        </div>
      </div>

      <div className="team-members">
        {teamMembers.map((member, index) => (
          <div className="team-member" key={index}>
            <div className="member-header">
              {member.image && (
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
              )}
              <div className="member-basic-info">
                <h2>{member.name}</h2>
                <p className="degree">{member.degree}</p>
                {member.email && (
                  <p className="contact">
                   <a href={`mailto:${member.email}`}>{member.email}</a>
                  </p>
                )}
                {member.linkedin && (
                  <p className="contact">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer">{member.linkedin}</a>
                  </p>
                )}
              </div>
            </div>
            <p className="bio">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
