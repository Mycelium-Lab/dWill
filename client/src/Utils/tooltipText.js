export const tooltipText = {
    tokens: `If you bequeath an unlimited amount of tokens, then the heir dWill be able to pick up all the tokens of the selected type that dWill be on your wallet at the time the dWill is activated.
If you create a dWill with restrictions, then at the time the dWill is activated, the heir dWill be able to pick up no more than the number of tokens you have specified. A separate dWill is created for each token type. 


For example: If you had 1000 USDC in your account at the time the dWill was activated and created a dWill with 500 USDC limits, then your heir dWill be able to collect 500 USDC only. If you did not specify a limit when you created your dWill, your heir dWill take 1,000 USDCs.`,
    network: `Each dWill only works within the network on which it was created. In order to inherit tokens on different networks, you need to create a separate certificate for each of them.


For example: If you want to bequeath USDC on Ethereum and Polygon networks, you need to create a dWill on the Ethereum network, then switch dWill to the BSC network and create another dWill.
`,
    wallet: `Specify the wallet that will be able to collect tokens from your wallet after the expiration of the inactivity period that you specify below.`,
    time: `The heir dWill only be able to collect tokens from your wallet if the dWill is activated. The dWill is activated after the expiration of the term (timer) set by the testator when creating the dWill.
It works the following way:
1. When creating a dWill, the testator sets a timer indicating how many years, months and days must pass before the heir can pick up the dWill.
2. After the timer comes to an end, the heir dWill be able to take the inheritance directly from your wallet.
3. At any time, you can reset the timer to its original state by clicking the "Reset timers" button, postponing the activation of the dWill.


For example:
If you bequeathed tokens by setting a timer for a year and after 364 days reset the timer on the "Reset timers" button, your heir dWill need to wait at least another year to activate the dWill.`,
    NFTMessage: `You can add an encrypted letter for your heir as an NFT token. The contents of the letter dWill be available only to the heir and can be read by him/her after activating the dWill.`,
    delivery: `After activating the dWill, the heir dWill need to go to dWill.app and pick up the inheritance using the "Receive" button. Activate this function to deliver tokens to the heir automatically after the dWill timer expires.`,
    notifications: `Set up dWill notifications in order not to forget to update the timer, pick up the dWill, etc.`,
    approve: `In order to create a dWill, you need to perform 2 transactions: Approve and Create a dWill`,
    wills: `Here you can see the dWills created by you and the remaining period of inactivity for each of them.`,
    inheritances: `Here you can see a list of dWills that are intended for you. You can receive a dWill after the period of inactivity of the testator's wallet exceeds the deadline set by him.`
}
