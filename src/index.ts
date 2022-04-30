import puppet from 'puppeteer'

interface NorthOptions {
  headless?: boolean
}

export class North {
  private browser!: puppet.Browser
  private page!: puppet.Page
  public readonly prefix: string
  public readonly options: NorthOptions

  constructor(prefix: string, options: NorthOptions = {}) {

    if (!prefix) throw Error('No prefix provided!')

    this.prefix = prefix
    this.options = options
  }

  /**
   * Logs into compass. This could take long
   * 
   * @param username Username used to log in
   * @param password Password used to log in
   * 
   */
  public async login(username: string, password: string) {
    if (!username) throw Error('Username must be provided')
    if (!password) throw Error('Password must be provided')

    this.browser = await puppet.launch({ headless: this.options.headless })
    this.page = await this.browser.newPage()

    await this.page.goto(`https://${this.prefix}.compass.education/login.aspx?sessionstate=disabled`, { waitUntil: 'networkidle2' }).catch((why) => console.error(why))

    await this.page.type('input[name="username"]', username, { delay: 5 })
    await this.page.type('input[name="password"]', password, { delay: 5 })

    await this.page.waitForTimeout(500)

    await this.page.click('input[name="button1"]')

    await this.page.waitForTimeout(3750)

    // This was for testing purposes
    // await this.page.click('a[class="x-btn x-unselectable x-btn-toolbar x-box-item x-toolbar-item x-btn-blue-button-toolbar-small x-icon x-btn-icon x-btn-blue-button-toolbar-small-icon"]').catch(() => console.log('That fucked up'))

    await this.page.waitForTimeout(5000)
  }

  /**
   * Retrieve your classes for today.
   * 
   * @returns null If there are no classes
   * @returns Array<String> Returns your classes
   */
  public async classes() {
    if (!this.page || !this.browser) throw Error('You need to login first!')

    const classes: string[] = []
    // @ts-ignore
    const _classes: string[] = await this.page.evaluate(() => [...document.querySelectorAll('.ext-evt-bd')].filter(elem => elem.lang === 'en-GB').map(elem => elem.innerText)).catch(() => null)

    if (_classes.length === 0) return null

    for (const className in _classes) {
      const info = _classes[className].split(' ')

      classes.push(`Time: ${info[0]} Period: ${info[1]} Room: ${info[5]} Teacher: ${info[8] === undefined ? info[7] : info[8]}`)
    }

    return classes
  }
}
