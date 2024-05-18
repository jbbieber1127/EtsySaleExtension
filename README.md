**Disclaimer**

This chrome extension only aims to utilize existing Etsy functionality to make managing sales easier. You, as the user of the extension, are responsible for making sure it is compliant with Etsy's [Terms of Use](https://www.etsy.com/legal/terms-of-use).

**Installation**

See Google's documentation on how to install an unpacked Chrome extension:

https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

**Usage**

Updates may be in progress, so this section may be out of date.

When you are not on Etsy's "Create a Sale" page, the extension will show a button to take you there.

When are you on the "Create a Sale" page, you will see the extension's interface for creating multiple sales.

![image](https://github.com/jbbieber1127/EtsySaleExtension/assets/18647861/7428ec95-8dea-4be8-b0e3-3487f4124b33)

The user interface is pretty self-explanatory, so I won't cover that.

Once you click the "Create Sales" button, it will start generating sales based on the input information. 
- The sales will run back-to-back with the given duration and number of sales. 
- Start dates are at 12AM and end dates are at 11:59:59PM
  - these should be local to you, but I won't be testing in other regions myself.
- Length of the sale is the number of calendar days on which the sale will be active
  - ex: a 1 day sale on May 17th, 2024 will start at 12AM on May 17th, 2024 and last until 11:59:59PM on May 17th, 2024
  - ex: a 2 day sale starting on May 17th, 2024 will start at 12AM on May 17th, 2024 and last until 11:59:59 on May 18th, 2024
- The names of the sales are: Start date formatted YYYYMMdd + "TO" + end date formatted YYYYMMdd
  - ex: if you have a sale starting on May 17th, 2024 and ending May 24th, 2024, the name will be 20240517TO20240524
