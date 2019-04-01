import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import Rebase from 're-base';
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { NavLink } from "react-router-dom";
import PreviewPicture from './PreviewPicture';




const config = {
    apiKey: process.env.REACT_APP_FIREBASE_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID
};

const app = firebase.initializeApp(config);
const base = Rebase.createClass(app.database());

class Home extends React.Component {
  constructor() {
    super();
    this.ref = firebase.database().ref('barters');
    this.state = {
      isSignedIn: false,
      title: '',
      descr: '',
      photoUrl: null,
      userID: '',
      dateTime: '',
      keys: [],
    }
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  uiConfig = {
    signInFlow: "popup",
    signInOptions: [
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    callbacks: {
      signInSuccess: () => false
    }
  }
  onSubmit(event){
      var newPostKey = firebase.database().ref().child('barters').push().key;
      const {isSignedIn, title, descr, photoUrl, userID} = this.state;
      firebase.database().ref('barters/' + newPostKey).set({
          dateTime: firebase.database.ServerValue.TIMESTAMP,
          descr,
          photoUrl,
          title,
          userID,
    });

    this.setState({dateTime: ''});
    this.setState({descr: ''});
    this.setState({photoUrl: ''});
    this.setState({title: ''});
  }

  componentDidMount = ()=>{
    firebase.auth().onAuthStateChanged(user =>{
      this.setState({isSignedIn:!!user});
      this.setState({userID:user['uid']});
    });
    firebase.database().ref('barters').on('value', this.gotData.bind(this), this.errData);
  }
  gotData(data){
    //console.log(data.val())
    var barters = data.val();
    var keys = Object.keys(barters);
    const result = []
    for(var i = 0; i < keys.length;i++){
      var k = keys[i];
      var user = barters[k].userID;
      var title = barters[k].title;
      var photoUrl = barters[k].photoUrl;
      result.push({user, title, photoUrl});
    }
    this.setState({keys: result});
  }

  errData(err){
    console.log('Error!');
    console.log(err);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  render() {
    const keys = this.state.keys;
    const itemList = keys.map(itemId => {
      console.log(itemId, "ok")
      return(
        <li>{itemId.title}: <PreviewPicture photoUrl={itemId.photoUrl}/></li>
      )
    });
    return (
      <div className='home'>
      {this.state.isSignedIn ? (
          <span>
           <header>
          <div className='wrapper'>
          <nav className ="navbar navbar-expand-lg navbar-light bg-light">
            <a className ="navbar-brand" href="#">NYU Barter</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className ="navbar-toggler-icon"></span>
            </button>
          <div className ="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className ="navbar-nav mr-auto">
              <li className ="nav-item active">
              <NavLink to="/inventory"><button className = "btn btn-info" type="myItems">My Items</button></NavLink>
            </li>
            <li className="nav-item">
             <NavLink to="/interests"><button className = "btn btn-info" type="interestedItems">Interested Items</button></NavLink>
            </li>
            <li className ="nav-item">
                    <button className = "btn btn-info" onClick={() => firebase.auth().signOut()}>Logout</button>
            </li>
            </ul>
          </div>

            {/* <nav className = "navbar navbar-expand-lg navbar-light bg-light">
              <h1 className = "navbar-brand">NYU Barter</h1>
              <script src="https://www.gstatic.com/firebasejs/5.8.4/firebase.js"></script>
              <button className = "navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className = "navbar-toggler-icon"></span>
              </button>
              <div className ="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className ="navbar-nav mr-auto">
                  <li className  ="nav-item active">
                    <NavLink to="/inventory"><button className = "btn btn-info" type="myItems">My Items</button></NavLink>
                  </li>
                  <li className ="nav-item">
                    <NavLink to="/interests"><button className = "btn btn-info" type="interestedItems">Interested Items</button></NavLink>
                  </li>
                  <li className ="nav-item">
                    <button className = "btn btn-info" onClick={() => firebase.auth().signOut()}>Logout</button>
                  </li>
                </ul>
              </div> 

              <form class="form-inline my-2 my-lg-0">
                <input class="form-control mr-sm-2"  type="text" name="search" placeholder="Search for items" />
                <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
              
            </nav> */}
            <form className ="form-inline my-2 my-lg-0">
      <input className ="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
      <button className ="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
            </nav>
          </div>
      </header>
      <div className='container'>
        <section className='add-item'>
              <form>
              <input type="text" name="title" placeholder="What item do you want to trade?" onChange={this.handleChange} value={this.state.item} />
              <input type="text" name="descr" placeholder="Describe your item" onChange={this.handleChange} value={this.state.descr} />
              <label class="upload-group">
              Upload Image
              <input type="file" class="upload-group" id="file" onChange={(event) => {
                this.addPicture(event);
              }}/>
              </label>
              <PreviewPicture photoUrl={this.state.photoUrl}/>
              <button type="btn btn-priamry" onClick={this.onSubmit} type="reset">Add Item to Barter</button>
              </form>
        </section>
        <section className='display-item'>
          <div className='wrapper'>
            <ul>
              {itemList}
            </ul>
          </div>
        </section>
      </div>
          </span>
        ) : (
          <StyledFirebaseAuth class="LoginButtons"
            uiConfig={this.uiConfig}
            firebaseAuth={firebase.auth()}
          />
        )}
      </div>
    );
  }

  addPicture(event){
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onloadend = ()=>{
      this.setState({
        photoUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }
}

export default Home;
