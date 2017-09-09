'use strict';

const URI = require('urijs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const DEFAULT_NUM = 999;

module.exports = class User{
  constructor(href){
    this.id = new URI(href).search(true).person_id;
    this.points_href = href;
    this.pointsPromise = this.initPoints();
    this.regional_rank = DEFAULT_NUM;
    this.national_rank = DEFAULT_NUM;
  }

  fetchPoints(){
    return fetch(`https://www.britishcycling.org.uk/${this.points_href}`)
      .then(res => res.text());
  }

  loadPoints(){
    return fs.readFileAsync(path.join(__dirname, 'tests', 'fixtures', 'person.html')).then(file => {
      return file.toString();
    })
  }

  getPoints(){
    if(process.env.test){
      return this.loadPoints();
    } else {
      return this.fetchPoints();
    }
  }

  initPoints(){
    return this.getPoints().then(body => {
      const $ = cheerio.load(body);
      $('dd').each( (i, el) => {
        this.parseDd($(el).text());
      });
      this.name = $('main h1').text().split(':')[1].trim();
      return this;
    });
  }

  parseDd(str){
    let arr = str.split(':');
    arr[1] = arr[1].trim();
    switch(arr[0]){
      case 'Current Club':
        this.current_club = arr[1];
        break;
      case 'Gender':
        this.gender = arr[1];
        break;
      case 'Age Category':
        this.age_cateogry = arr[1];
        break;
      case 'Category':
        this.category = arr[1];
        break;
      case 'National Rank':
        this.national_rank = Number(arr[1]) || DEFAULT_NUM;
        break;
      case 'Regional Rank':
        this.regional_rank = Number(arr[1]) || DEFAULT_NUM;
        break;
      case 'Regional Points':
        this.regional_points = Number(arr[1]) || DEFAULT_NUM;
        break;
      case 'National Points':
        this.national_points = Number(arr[1]) || DEFAULT_NUM;
        break;
    }
  }

  static compareFnc(a, b){
    if(a.national_rank !== DEFAULT_NUM || b.national_rank !== DEFAULT_NUM){
      return a.national_rank - b.national_rank;
    } else if (a.regional_rank !== DEFAULT_NUM || b.regional_rank !== DEFAULT_NUM){
      return a.regional_rank - b.regional_rank;
    }
    return 0;
  }

  static sort(users){
    return users.sort(this.compareFnc);
  }
}
