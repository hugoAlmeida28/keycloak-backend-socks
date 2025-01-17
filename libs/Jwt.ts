import { Token } from './Token'
import { verify, VerifyOptions } from 'jsonwebtoken'
import { IInternalConfig } from './index'
import { AxiosInstance } from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent'

export class Jwt {
  constructor (private readonly config: IInternalConfig, private readonly request: AxiosInstance) {}

  async verifyOffline (accessToken: string, cert: any, options?: VerifyOptions): Promise<Token> {
    return await new Promise((resolve, reject) => {
      verify(accessToken, cert, options, (err) => {
        if (err != null) reject(err)
        resolve(new Token(accessToken))
      })
    })
  }

  decode (accessToken: string): Token {
    return new Token(accessToken)
  }

  async verify (accessToken: string): Promise<Token> {

    if (this.config.socks_enabled) {
      const agent = new SocksProxyAgent(`socks5://${this.config.socks_url}`);
      await this.request.get(`${this.config.prefix}/realms/${this.config.realm}/protocol/openid-connect/userinfo`, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        httpAgent: agent,
        httpsAgent: agent
      })
    }
    else {
      await this.request.get(`${this.config.prefix}/realms/${this.config.realm}/protocol/openid-connect/userinfo`, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })

    }

    return new Token(accessToken)
  }
}
