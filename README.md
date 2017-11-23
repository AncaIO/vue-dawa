# vue-dawa 

This component allows you to create an address-autocomplete using Danmarks Adressers WEB API in Vue 2 applications. 

It relies heavily on https://github.com/DanmarksAdresser/dawa-autocomplete2, but uses the axios library instead of fetch for making requests and it is fully "vue-ified".

## [Demo](https://vue-dawa.anca.io) 

## Installation

```bash
npm install --save ancaio-vuejs-dawa
```
or 
```bash
yarn add ancaio-vuejs-dawa
```

## Usage
Make sure to import the component: 
```javascript
  import VueDawa from 'ancaio-vuejs-dawa'
```
Add it to its parent's components: 
```javascript
 export default {
  ...
  components: {
    VueDawa
  }
  ...
 }
```