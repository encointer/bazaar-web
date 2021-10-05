## Web View of registered communities, businesses and offerings

To register a community, first checkout [encointer-node](https://github.com/encointer/encointer-node), cd into the root directory, then build the node and run it (more details can be viewed on the repository page):
### Build node
```console
git clone https://github.com/encointer/encointer-node.git
cd encointer-node
cargo build --release
```

Run dev node locally

```console
./target/release/encointer-node-notee --dev --tmp --enable-offchain-indexing true --ws-port 9944 --rpc-methods unsafe
```

After the node is running, cd into encointer-node/client and run the following two scripts consequently:
```console
./bot-community.py init
./register-businesses.py
```
The first script will register a community on the node and the second will register two businesses with offerings for the community.
You can repeat this two scripts, if you want to add further communities and register more businesses and offerings.

Then you can install the dependencies:
```console
yarn install
```
And run the react app:
```console
yarn start
```
Alternatively, you can run the app with Mockdata: 
```console
yarn dev
```
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
