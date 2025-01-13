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
                    '020000000001024724230ed9c3a3c98e95e12ea899c85ee951d8ee337956c34dfeaa73ada5066a0100000000ffffffff9fd3afc8ad2d6fb18cd2f0308cb61478be502bbe49e643661c7137acf76cffc56900000000ffffffff02640000000000000016001462f5fcab18cc7089d8cb39869a71224afe90b1556257000000000000160014c3b5f396332bf6176b83befa762b509b06fa3ca102473044022047436f61044d4fc397d19b578aa54cf160d89c5b4b6552d142a399da74346aba02205876bbdde32988d0b9f91bb876a9b325b96510c3d7be8e3c20c71ed87ab30646012103f9c24833c7ccf76eca75a2a0f3f62be094825b9d24da9880464e82e0a233b11902473044022031863623e45852f58f4461189bd68e1395677c4664913fe798c5d77dfaa9cc7c0220244561c8fe74a3df16493dd0d510b4a7d1d7a726b07f1e96fe4ab7c917d349d3012103f9c24833c7ccf76eca75a2a0f3f62be094825b9d24da9880464e82e0a233b11900000000s'
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

                 const result = await providers.bitcoinProvider?.pushTx('020000000001024724230ed9c3a3c98e95e12ea899c85ee951d8ee337956c34dfeaa73ada5066a0100000000ffffffff9fd3afc8ad2d6fb18cd2f0308cb61478be502bbe49e643661c7137acf76cffc56900000000ffffffff02640000000000000016001462f5fcab18cc7089d8cb39869a71224afe90b1556257000000000000160014c3b5f396332bf6176b83befa762b509b06fa3ca102473044022047436f61044d4fc397d19b578aa54cf160d89c5b4b6552d142a399da74346aba02205876bbdde32988d0b9f91bb876a9b325b96510c3d7be8e3c20c71ed87ab30646012103f9c24833c7ccf76eca75a2a0f3f62be094825b9d24da9880464e82e0a233b11902473044022031863623e45852f58f4461189bd68e1395677c4664913fe798c5d77dfaa9cc7c0220244561c8fe74a3df16493dd0d510b4a7d1d7a726b07f1e96fe4ab7c917d349d3012103f9c24833c7ccf76eca75a2a0f3f62be094825b9d24da9880464e82e0a233b11900000000')
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
                  const result = await providers.bitcoinProvider?.sendBitcoin(address, 500)
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
