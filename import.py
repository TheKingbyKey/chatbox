# -*- coding: utf-8 -*-
"""
Created on Fri May 29 13:20:47 2020

@author: Bharti Arora
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
engine = create_engine("mysql+pymysql://root:arora@localhost/chatbox")
db = scoped_session(sessionmaker(bind=engine))

if __name__ == "__main__":
    db.execute("CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50) NOT NULL,email VARCHAR(50) NOT NULL,username VARCHAR(50) NOT NULL,password VARCHAR(50) NOT NULL);")
    db.execute("CREATE TABLE personal(id INT AUTO_INCREMENT PRIMARY KEY,userid INT,address VARCHAR(100) NULL,company VARCHAR(100) NULL,FOREIGN KEY (userid) REFERENCES users(id));")
    db.execute("CREATE TABLE channels(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(50) NOT NULL,admin INT,mode VARCHAR(10) NOT NULL,password VARCHAR(20) NULL,FOREIGN KEY (admin) REFERENCES users(id));")   
    db.execute("CREATE TABLE messages(id INT AUTO_INCREMENT PRIMARY KEY,content VARCHAR(200) NOT NULL,type VARCHAR(50) NOT NULL,userid INT,channelid INT,sendtime TIME NOT NULL,senddate DATE NOT NULL,FOREIGN KEY (userid) REFERENCES users(id),FOREIGN KEY (channelid) REFERENCES channels(id));")
    db.commit()