import {
  TomoContextProvider,
  TomoSocial,
  useTomoModalControl,
  useTomoProps,
  useTomoProviders,
  useTomoWalletConnect,
  useTomoWalletState,
  useWalletList
} from '@tomo-inc/wallet-connect-sdk'
import React, { useEffect, useState } from 'react'

import {
  ChainType,
  TomoProviderSetting
  // @ts-ignore
} from '@tomo-inc/wallet-connect-sdk/dist/state'
import '@tomo-inc/wallet-connect-sdk/style.css'
import { btcWalletList, cosmosWalletList, InscriptionResult, Network, UTXO } from '../main'

// window.injectedTomo = {
//   info: {
//     name: 'Tomo Inject xxx',
//     logo: 'https://logincdn.msauth.net/16.000.30389.5/images/favicon.ico'
//   },
//   bitcoin: window.unisat,
//   cosmos: window.keplr
// }

export default function Demo() {
  const [style, setStyle] = useState<TomoProviderSetting['style']>({
    rounded: 'small',
    theme: 'light',
    primaryColor: '#FF7C2A'
  })

  return (
    <TomoContextProvider
      style={style}
      // NOTE @tomo-inc/wallet-connect-sdk에 코스모스테이션이 등록이 안되면 자동 리스팅은 안됨.
      // NOTE 해당 레포를 통해서 커스텀 월렛 등록이 가능한 형태이지만, 커스텀 월렛은
      // NOTE 디앱 개발자가 직접 아래 코드처럼 등록해야함.
      // @ts-ignore
      additionalWallets={[...btcWalletList, ...cosmosWalletList]}
    >
      <ChildComponent style={style} setStyle={setStyle} />
    </TomoContextProvider>
  )
}

type ChildProps = {
  style: TomoProviderSetting['style']
  setStyle: (v: TomoProviderSetting['style']) => void
}
export function ChildComponent(props: ChildProps) {
  const tomoModal = useTomoModalControl()
  const tomoWalletState = useTomoWalletState()
  const providers = useTomoProviders()
  const tomoProps = useTomoProps()
  const tomoWalletConnect = useTomoWalletConnect()
  const walletList = useWalletList()

  const cosmosIsConnect = tomoWalletState.cosmos?.connected
  const btcIsConnect = tomoWalletState.bitcoin?.connected

  const [cosmosAddress, setCosmosAddress] = useState('')
  const [bitcoinAddress, setBitcoinAddress] = useState('')
  const [curChainType, setCurChainType] = useState<ChainType>('bitcoin')

  const [testGetAddress, setTestGetAddress] = useState('')
  const [testGetBalance, setTestGetBalance] = useState(0)
  const [testGetNetwork, setTestGetNetwork] = useState('')
  const [testSwitchNetwork, setTestSwitchNetwork] = useState('')
  const [testgetBTCTipHeight, setTestgetBTCTipHeight] = useState(0)
  const [testgetUtxos, setTestgetUtxos] = useState<UTXO[]>([]) 
  const [testgetInscriptions, setTestgetInscriptions] = useState<InscriptionResult>() 
  const [testPushTx, setTestPushTx] = useState('') 
  const [testSendBtc, setTestSendBtc] = useState('') 
  const [testSignMessageEcdsa, setTestSignMessageEcdsa] = useState('') 
  const [testSignMessageBip322Simple, setTestSignMessageBip322Simple] = useState('') 
  const [testSignMessageBip322Custom,setTestSignMessageBip322Custom] = useState('') 



  const sendAtom = async (address: string, amount: string) => {
    if (!providers.cosmosProvider) {
      throw new Error('cosmosProvider not found')
    }
    const selfAddress = await providers.cosmosProvider.getAddress()
    const client = await providers.cosmosProvider.getSigningStargateClient()
    const result = await client.sendTokens(
      selfAddress,
      address,
      [
        {
          denom: 'uatom',
          amount: amount
        }
      ],
      {
        amount: [{ denom: 'uatom', amount: '500' }],
        gas: '200000'
      }
    )
    console.log('result', result)
  }

  useEffect(() => {
    providers.bitcoinProvider?.on('accountChanged', () => {
      console.log('first')
    })

    providers.bitcoinProvider?.on('accountsChanged', () => {
      console.log('second')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers.bitcoinProvider])

  return (
    <div className={'tomo-social tm-flex tm-h-full tm-w-full tm-text-sm'}>
      <div className={'tomo-social tm-flex tm-h-screen tm-w-screen tm-text-sm'}>
        <div
          className={
            'tm-hidden tm-h-full tm-flex-col tm-gap-4 tm-overflow-auto tm-border-r tm-border-r-tc1/10 tm-p-10 md:tm-flex md:tm-flex-1'
          }
        >
          <div className={'tm-flex tm-flex-wrap tm-gap-3'}>
            <LodingButton
              disabled={cosmosIsConnect}
              onClick={() => {
                tomoModal.open('cosmos')
              }}
            >
              tomo modal - cosmos
            </LodingButton>

            <LodingButton
              disabled={btcIsConnect}
              onClick={async () => {
                const result = await tomoModal.open('bitcoin')
                console.log('modal result', result)
              }}
            >
              tomo modal - bitcoin
            </LodingButton>
            <LodingButton
              disabled={!btcIsConnect && !cosmosIsConnect}
              onClick={async () => {
                await tomoWalletConnect.disconnect()
              }}
            >
              disconnect
            </LodingButton>

            <div className={'tm-w-full'} />
            <input
              value={cosmosAddress}
              onChange={(e) => setCosmosAddress(e.target.value)}
            />
            <LodingButton
              disabled={!cosmosIsConnect}
              onClick={async () => {
                await sendAtom(cosmosAddress, '10000')
              }}
            >
              send atom
            </LodingButton>

            <LodingButton
              disabled={!cosmosIsConnect}
              onClick={async () => {
                const result =
                  await providers.cosmosProvider?.getBalance('uatom')
                console.log('cosmos balance', result)
              }}
            >
              cosmosProvider.getBalance('uatom')
            </LodingButton>

            <div className={'tm-w-full'} />
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getBalance()
                  console.log('btc balance', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBalance()
            </LodingButton>

            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result =
                    await providers.bitcoinProvider?.getInscriptions()
                  console.log('btc getInscriptions', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getInscriptions()
            </LodingButton>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getUtxos(
                    await providers.bitcoinProvider?.getAddress()
                  )
                  console.log('btc getUtxos', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getUtxos()
            </LodingButton>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result =
                    await providers.bitcoinProvider?.getBTCTipHeight()
                  console.log('btc getBTCTipHeight', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBTCTipHeight()
            </LodingButton>

            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getNetwork()
                  console.log('btc getNetwork', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getNetwork()
            </LodingButton>

            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.switchNetwork(
                    Network.TESTNET
                  )
                  console.log('btc switch network', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc switch to testnet()
            </LodingButton>

            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.switchNetwork(
                    Network.SIGNET
                  )
                  console.log('btc switch network', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc switch to signet()
            </LodingButton>

            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getAddress()
                  console.log('btc address ', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc ()
            </LodingButton>

            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.switchNetwork(
                    Network.MAINNET
                  )
                  console.log('btc switch network', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc switch to mainnet()
            </LodingButton>

            <div className={'tm-w-full'} />
            <input
              value={bitcoinAddress}
              onChange={(e) => setBitcoinAddress(e.target.value)}
            />
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.sendBitcoin(
                    bitcoinAddress,
                    1300
                  )
                  console.log(`send btc to ${bitcoinAddress}`, result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              send btc()
            </LodingButton>

            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.pushTx(
                    '02000000000101fcd432b3c65a28542b042f6f37815d98e3011a58b06847e9cc35e04e73cd48bc0100000000ffffffff021027000000000000160014de303a7dd3ca0d4c7ad4408063283d20e27eb82080171e0000000000160014267eefafde046a01bb4304013c1bcc0330f2032202473044022066967ef2cf14058b3dfadc8ed542623ac485d31f5e435b0cda1e0362cf4d47a002204df58e8c66763c8f5e347f9cf72b8c78022f3b74871268acde7a0a1dd39068b201210209375d3e71b0c54a7081e865a7139e7ef49c227e95e7aedb7ec0700819392a4500000000'
                  )
                  console.log('btc push tx result', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              {'push tx'}
            </LodingButton>

            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'ecdsa'
                  )
                  console.log('btc signMessage ecdsa', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'ecdsa')
            </LodingButton>

            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'bip322-simple'
                  )
                  console.log('btc signMessage bip322-simple', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'bip322-simple')
            </LodingButton>

            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result =
                    await providers.bitcoinProvider?.signMessageBIP322('11')
                  console.log('btc signMessage bip322-simple-custom', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'bip322-simple-custom')
            </LodingButton>
          </div>
          <StyleSetting {...props} />

          <ShowJson obj={tomoWalletState} title={'useTomoWalletState'} />
          <ShowJson obj={providers} title={'useTomoProviders'} />
          <ShowJson obj={tomoProps} title={'useTomoProps'} />
          <ShowJson obj={walletList} title={'useWalletList'} />
        </div>
        <div
          className={
            'tm-flex tm-h-full tm-w-full tm-flex-col tm-items-center tm-gap-4 tm-overflow-auto tm-px-4 tm-py-10 md:tm-w-auto md:tm-px-6'
          }
        >
          <div>tomo connect</div>
          <div>
            <LodingButton onClick={() => setCurChainType('bitcoin')}>
              bitcoin
            </LodingButton>
            <LodingButton onClick={() => setCurChainType('cosmos')}>
              cosmos
            </LodingButton>
          </div>
          <div>
            <LodingButton
              onClick={() => {
                tomoModal.open(curChainType)
              }}
            >
              open modal
            </LodingButton>
            <LodingButton
              disabled={!btcIsConnect && !cosmosIsConnect}
              onClick={async () => {
                await tomoWalletConnect.disconnect()
              }}
            >
              disconnect
            </LodingButton>
          </div>

          <div>
            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getAddress()
                  console.log('btc address ', result)
                  setTestGetAddress(result || 'nice')
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getAddress()
            </LodingButton>
            <div>{testGetAddress}</div>
          </div>

          <div>
            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getBalance()
                  setTestGetBalance(result || 0)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBalance()
            </LodingButton>
            <div>{testGetBalance}</div>
          </div>

          <div>
            {/* NOTE For Test */}
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.getNetwork()
                  setTestGetNetwork(result || '')
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getNetwork()
            </LodingButton>
            <div>{testGetNetwork}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                 await providers.bitcoinProvider?.switchNetwork(Network.MAINNET)
                 setTestSwitchNetwork('mainnet')
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc switchNetworkToMain()
            </LodingButton>
            <div>{testSwitchNetwork}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                 await providers.bitcoinProvider?.switchNetwork(Network.SIGNET)
                 setTestSwitchNetwork('signet')

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc switchNetworkToSignet()
            </LodingButton>
            <div>{testSwitchNetwork}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                 const result = await providers.bitcoinProvider?.getBTCTipHeight()
                 setTestgetBTCTipHeight(result || 0)

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getBTCTipHeight()
            </LodingButton>
            <div>{testgetBTCTipHeight}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {

                 const result = await providers.bitcoinProvider?.getUtxos(await providers.bitcoinProvider?.getAddress())
                 setTestgetUtxos(result || [])
                 console.log(result)

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getUtxos()
            </LodingButton>
            <div>{testgetUtxos.find(x=>x!==undefined)?.txid || ''}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {

                 const result = await providers.bitcoinProvider?.getInscriptions()
                 setTestgetInscriptions(result)
                 console.log(result)

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc getInscriptions()
            </LodingButton>
            <div>{`${testgetInscriptions?.total}`}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {

                 const result = await providers.bitcoinProvider?.pushTx('02000000000101fcd432b3c65a28542b042f6f37815d98e3011a58b06847e9cc35e04e73cd48bc0100000000ffffffff021027000000000000160014de303a7dd3ca0d4c7ad4408063283d20e27eb82080171e0000000000160014267eefafde046a01bb4304013c1bcc0330f2032202473044022066967ef2cf14058b3dfadc8ed542623ac485d31f5e435b0cda1e0362cf4d47a002204df58e8c66763c8f5e347f9cf72b8c78022f3b74871268acde7a0a1dd39068b201210209375d3e71b0c54a7081e865a7139e7ef49c227e95e7aedb7ec0700819392a4500000000')
                 setTestPushTx(result || '')
                 console.log(result)

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc PushTx()
            </LodingButton>
            <div>{testPushTx}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const signetAddress = 'tb1qvt6le2cce3cgnkxt8xrf5ufzftlfpv24gxgamu'
                  const mainnetAddress = 'bc1qzjgzf8cjma3eg530fc5zypj7kmgwt48wxtpruu'
                  let address = ''
                  if (await providers.bitcoinProvider?.getNetwork() == Network.MAINNET) {
                    address = mainnetAddress
                  } else {
                    address = signetAddress
                  }
                  const result = await providers.bitcoinProvider?.sendBitcoin(address, 100)
                  setTestSendBtc(result || 'fail')
                  console.log(result)

                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc SendBTC()
            </LodingButton>
            <div>{testSendBtc}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'ecdsa'
                  )
                  setTestSignMessageEcdsa(result || 'fail')
                  console.log('btc signMessage ecdsa', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'ecdsa')
            </LodingButton>
            <div>{testSignMessageEcdsa}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessage(
                    '11',
                    'bip322-simple'
                  )
                  setTestSignMessageBip322Simple(result || 'fail')
                  console.log('btc signMessage bip322-simple', result)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              btc signMessage('11', 'bip322-simple')
            </LodingButton>
            <div>{testSignMessageBip322Simple}</div>
          </div>

          <div>
            <LodingButton
              disabled={!btcIsConnect}
              onClick={async () => {
                try {
                  const result = await providers.bitcoinProvider?.signMessageBIP322('11')
                  setTestSignMessageBip322Custom(result || 'fail')
                  console.log('btc signMessage bip322-simple-custom', result)
                } catch (e) {
                  console.log(e)
                }
              }}

            >
              btc signMessage('11', 'bip322-simple-custom')
            </LodingButton>
            <div>{testSignMessageBip322Custom}</div>
          </div>

          <TomoSocial chainType={curChainType} />
        </div>
      </div>
    </div>
  )
}

function StyleSetting({ style, setStyle }: ChildProps) {
  return (
    <div className={'tm-flex tm-gap-4'}>
      <div>style</div>
      <div>
        <div>rounded</div>
        <select
          value={style?.rounded}
          onChange={(e) => {
            setStyle({
              ...style,
              // @ts-ignore
              rounded: e.target.value
            })
          }}
        >
          <option>none</option>
          <option>small</option>
          <option>medium</option>
          <option>large</option>
        </select>
      </div>
      <div>
        <div>theme</div>
        <div>
          <LodingButton
            onClick={(e) => {
              setStyle({
                ...style,
                theme: 'light'
              })
            }}
          >
            light
          </LodingButton>
          <LodingButton
            onClick={(e) => {
              setStyle({
                ...style,
                theme: 'dark'
              })
            }}
          >
            dark
          </LodingButton>
        </div>
      </div>
      <div>
        <div>primary</div>
        <div>
          <select
            value={style?.primaryColor}
            onChange={(e) => {
              setStyle({
                ...style,
                primaryColor: e.target.value
              })
            }}
          >
            <option value={'#121212'}>default</option>
            <option value={'#FF7C2A'}>#FF7C2A</option>
            <option value={'#F21F7F'}>#F21F7F</option>
            <option value={'#fcd535'}>#fcd535</option>
            <option value={'#4285f4'}>#4285f4</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function LodingButton({
  onClick,
  disabled,
  ...otherProps
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      {...otherProps}
      className={'tm-border tm-border-tc1 tm-px-1.5'}
      disabled={loading || disabled}
      onClick={async () => {
        try {
          setLoading(true)
          // @ts-ignore
          await onClick()
        } finally {
          setLoading(false)
        }
      }}
    />
  )
}

const ShowJson = React.memo(function ShowJson({
  title,
  obj,
  rows = 10
}: {
  title: any
  obj: any
  rows?: number
}) {
  const jsonFn = function jsonValueFn(key: any, value: any) {
    // @ts-ignore
    if (key && this !== obj) {
      if (typeof value === 'object' || typeof value === 'function') {
        if (Array.isArray(value)) {
          return `Array(${value.length})`
        }
        return 'object'
      }
      return value
    }
    return value
  }
  return (
    <div>
      <div>{title}: </div>
      <textarea
        value={JSON.stringify(obj, jsonFn, '\t')}
        className={'tm-w-full tm-border tm-px-1'}
        rows={rows}
        readOnly
      ></textarea>
    </div>
  )
})
