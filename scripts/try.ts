
import { NetworkProvider, UIProvider} from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const exampleContent = {
        "name": "Trial Jetton2",
        "description": "First Trial Jetton",
        "symbol": "TRY2",
        "decimals": 9,
        "image": "https://static.vecteezy.com/system/resources/previews/023/506/852/non_2x/cute-kawaii-mushroom-chibi-mascot-cartoon-style-vector.jpg"
     };
     for (let key in exampleContent) {
        console.log(typeof key)
        console.log(key)
        // @ts-ignore.
        console.log(typeof exampleContent[key])
        // @ts-ignore.
        console.log(exampleContent[key])
      }
}