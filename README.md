# vue-dawa [![Build Status](https://travis-ci.org/AncaIO/vue-dawa.svg?branch=master)](https://travis-ci.org/AncaIO/vue-dawa)

This component allows you to create an address-autocomplete using Danmarks Adressers WEB API in Vue 2 applications. 

It relies heavily on https://github.com/DanmarksAdresser/dawa-autocomplete2, but uses the axios library instead of fetch for making requests and it is fully "vue-ified".

## [Demo](https://vue-dawa.anca.io) 

## Installation

```bash
npm install --save vue-dawa
```

## Usage
Make sure to import the component: 
```javascript
  import VueDawa from 'vue-dawa'
```
Add it to your components' components: 
```javascript
 export default {
  components: {
    VueDawa
  }
}
```
In your template: 
```vuejs
<vue-dawa @select="selectItem($event, 'yourAddressObject')"
  :val="yourAddressObject.oneLineAddress"
  :showMax="5"
  placeholder="Your Placeholder"
  containerId="your-container"
  fieldId="your-field-id"
  fieldName="your-field-name">
  <label slot="label-top" for="field-2">Your label</label>
</vue-dawa>
```
In your component's data, you will need to provide `yourAddressObject`.
```javascript
  data () {
    yourAddressObject: {
      oneLineAddress: ''
    }
  }
```
You will also need to define a method for modifying the selected address to your needs - if that is desired.
```javascript
// here the event payload is of the type "adresse"
translateData (address) {
  if (!address || !address.data) {
    return
  }
  return {
    id: address.data.id,
    street: address.data.vejnavn,
    streetNumber: address.data.husnr,
    floor: address.data.etage,
    door: address.data.dør,
    zipCode: address.data.postnr,
    city: address.data.postnrnavn,
    oneLineAddress: address.tekst
  }
}
```
If you will create multiple fields in the same component, you might want to handle the select event in a manner that will allow you to update whichever address object without writing custom handlers for each.
A quick example: 
```javascript
  // handle the select event emitted by vue-dawa
  selectItem (payload, objectName) {
   this.$set(this, objectName, this.translateData(payload))
  } 
```
## Events 
   | Event                  | Value                       |
   | ---------------------- |------------------------------------------| 
   | `select`                 | `Object` - the raw DAWA address object   | 
   | `listHeightUpdated`      | `double` - current height of results `ul`| 
   | `inputChanged`           | `String` - search terms changed          |  
   
## Props
|Prop|Required|Type|Purpose|
|---|---|---|---|
|`placeholder`|no|`String`| Displays a placeholder in the input field|
|`containerId`|yes|`String`| Provides the `id` attribute of the component wrapper and is used in computing a unique id for the list of results used in height detection|
|`containerClasses`|no|`String` or `Object`| Custom styling|
|`fieldId`|yes|`String`|When combined with a label, improves accessibility|
|`fieldClasses`|no|`String` or `Object`| Custom styling|
|`fieldName`|no|`String`|Can be useful in form validation|
|`listClasses`|no|`String` or `Object`| Custom styling|
|`listItemClasses`|no|`String` or `Object`| Custom styling. Active class is handled by the component already, but feel free to play.|
|`val`|no|`String`|Pre-populates the input field with an initial value|
|`addressId`|no|`String`| A DAWA address id. If provided, it will perform an automatic search on `created` and populate the field with the found address. It will also emit the `selected` event.|
|`options`|no|`Object`, see default options below | Configuring the DAWA service. NOTE: The component was only intended for full addresses, but it should work with other types. See DAWA's docs for more info|       
|`showMax`| no, but you might want it set| `Number`| Limits the number of visible results|
## Default options prop
```javascript 
{
  params: {},
  minLength: 2, // would leave this alone if I were you, it can lead to wonky behavior.
  retryDelay: 500,
  type: 'adresse',
  baseUrl: 'https://dawa.aws.dk',
  adgangsadresserOnly: false,
  stormodtagerpostnumre: true,
  supplerendebynavn: true,
  fuzzy: true,
}
```
## Overflow:hidden nuissance
If vue-dawa is placed in a container (or descendant of a container) with `overflow: hidden`, the list of results will be cut off. 
There is no easy or nice fix for this, unfortunately. 

What you CAN do, is leverage the `listHeightUpdated` event, which will pass to you the height of the list of results. 

You can use this height to compute a min-height property on the container in question or child of it, and give it a transition on the height for a smoother change. 
It's not flawless, but it will allow you to use the component in a container with `overflow: hidden`.  

## Styling 
You can require the default style: 
```javascript
require('vue-dawa/dist/vue-dawa.min.css')
```
or customize the css yourself. Remember you can add custom classes to all the elements of the componets. 
Here's a starting point for tweaking the default css.
```css
    .autocomplete-container {
        /* relative position for at de absolut positionerede forslag får korrekt placering.*/
        position: relative;
        width: 100%;
        max-width: 30em;
    }

    .autocomplete-container input {
        /* Både input og forslag får samme bredde som omkringliggende DIV */
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 5px;
    }

    .dawa-autocomplete-suggestions {
        position: absolute;
        z-index: 9999;
        width: 100%;
        margin: 0.15em 0 0 0;
        padding: 0;
        text-align: left;
        border-radius: 0.3125em;
        background: #fcfcfc;
        box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
        box-sizing: border-box;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
        margin: 0;
        list-style: none;
        cursor: pointer;
        padding: 0.4em 0.6em;
        color: #333;
        border: 0.0625em solid #ddd;
        border-bottom-width: 0;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        border-bottom-width: 0.0625em;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.active,
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
        background: #f0f0f0;
        color: #333;
    }
```
