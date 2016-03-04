# netiam-contrib-state

[![Build Status](https://travis-ci.org/netiam/contrib-state.svg)](https://travis-ci.org/netiam/contrib-state)
[![Dependencies](https://david-dm.org/netiam/contrib-state.svg)](https://david-dm.org/netiam/contrib-state)
[![npm version](https://badge.fury.io/js/netiam-contrib-state.svg)](http://badge.fury.io/js/netiam-contrib-state)

> A state plugin for netiam

## Get it

```
npm i -S netiam netiam-contrib-state
```

## Example

```js
netiam({plugins})
  .rest({model: User})
  .state.res({
    userModel: User,
    map: [
      {
        base: Component,
        state: UserComponent,
        baseField: 'componentId',
        userField: 'owner'
      },
      {
        base: Campaign,
        state: UserCampaign,
        baseField: 'campaignId',
        userField: 'owner'
      },
      {
        base: Node,
        state: UserNode,
        baseField: 'nodeId',
        userField: 'owner'
      }
    ]
  })
  .json()
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
