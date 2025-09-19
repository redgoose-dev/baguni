import { rm, mkdir, exists } from 'node:fs/promises'
import { Database } from 'bun:sqlite'
import { randomBytes } from 'node:crypto'
import minimist from 'minimist'
import { message, prompt, hashPassword, verifyEmail, verifyId } from './libs.js'

const { DATA_PATH } = Bun.env
const argv = minimist(process.argv.slice(2))
const paths = {
  seedDb: `./resource/seed.sql`,
  db: `${DATA_PATH}/db.sqlite`,
  env: '.env.local',
  preference: './resource/preference.json',
}
const pathList = [
  `${DATA_PATH}/origin`,
  `${DATA_PATH}/cover`,
  `${DATA_PATH}/cache`,
  `${DATA_PATH}/logs`,
  `${DATA_PATH}/tmp`,
]
let db

/**
 * 진행할것인지에 대한 확인
 * @return {Promise}
 */
async function confirm()
{
  let answer = await prompt('Do you really want to install? [y/N]')
  if (answer.toLowerCase() !== 'y')
  {
    message('error', 'You canceled the install.')
    process.exit()
  }
}

/**
 * check directories
 * 경로가 하나라도 만들어져 있으면 인스톨이 되어있다고 간주한다.
 *
 * @return {Promise<boolean>}
 */
async function checkData()
{
  const res = await Promise.all([
    ...(pathList.map(path => exists(path))),
    exists(paths.db),
  ])
  return res.includes(true)
}

async function confirmUninstall()
{
  const confirmDeleteData = await prompt('설치되어있는 데이터를 삭제할까요? [y/N]')
  if (confirmDeleteData.toLowerCase() === 'y')
  {
    // 설치된 데이터를 삭제한다.
    await removeData()
  }
  else
  {
    // 데이터가 존재하는데 삭제한다고 선택하지 않았으니 진행을 종료한다.
    message('error', `Can't proceed because the data already exists.`)
    process.exit()
  }
}

/**
 * 관리자 정보 입력받기
 * @return {Promise<object>}
 */
async function inputUserAccount()
{
  message('run', 'Enter admin information.')
  const id = await inputField({
    ask: '✏️ ID:',
    type: 'id',
    error: 'Invalid ID.',
  })
  const email = await inputField({
    ask: '✏️ E-Mail:',
    type: 'email',
    error: 'Invalid email address.',
  })
  const name = await inputField({
    ask: '✏️ Username:',
    error: 'Invalid name.',
  })
  const password = await inputField({
    ask: '✏️ Password:',
    error: 'Invalid password.',
  })
  return {
    id,
    email,
    name,
    password,
  }
}
function inputField(op)
{
  const { ask, type, error } = op
  return new Promise(async (resolve) => {
    const answer = await prompt(ask)
    if (!answer)
    {
      if (error) message('error', error)
      return resolve(inputField(op))
    }
    switch (type)
    {
      case 'email':
        if (!verifyEmail(answer))
        {
          if (error) message('error', error)
          return resolve(inputField(op))
        }
        break
      case 'id':
        if (!verifyId(answer))
        {
          if (error) message('error', error)
          return resolve(inputField(op))
        }
        break
    }
    resolve(answer)
  })
}

/**
 * create directories
 * @return {Promise<void>}
 */
async function createDirectories()
{
  await Promise.all(pathList.map(path => {
    return mkdir(path, { recursive: true })
  }))
  message('run', 'Create data directories.')
}

/**
 * create database
 * @return {Promise<void>}
 */
async function createDatabase()
{
  try
  {
    db = new Database(paths.db, {
      create: true,
    })
    let seed = Bun.file(paths.seedDb)
    seed = await seed.text()
    db.exec(seed)
    message('run', 'Create database.')
  }
  catch (e)
  {
    message('error', e.message)
    process.exit()
  }
}

/**
 * 계정 추가
 * @param {string} [user.email] 이메일 주소
 * @param {string} [user.name] 이름
 * @param {string} [user.password] 패스워드
 * @return {Promise<void>}
 */
async function addAccount(user)
{
  const { id, email, name, password } = user
  try
  {
    const sql = `INSERT INTO provider (code, user_id, user_name, user_avatar, user_email, user_password, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    db.run(sql, [ 'password', id, name, '', email, hashPassword(String(password)) ])
  }
  catch (e)
  {
    message('error', e.message)
    db.close()
    process.exit()
  }
  message('run', `You've entered your admin information.`)
}

async function setupPreference()
{
  try
  {
    const file = Bun.file(paths.preference)
    const pref = await file.json()
    pref.token = {
      accessSecret: randomBytes(16).toString('hex'),
      accessExpires: '7h',
      refreshSecret: randomBytes(24).toString('hex'),
      refreshExpires: '14d',
    }
    await Bun.write(`${DATA_PATH}/preference.json`, JSON.stringify(pref, null, 2))
    message('run', `Created preference.json`)
  }
  catch (e)
  {
    message('error', e.message)
    process.exit()
  }
}

async function removeData()
{
  const exist = await exists(DATA_PATH)
  if (exist) await rm(DATA_PATH, { recursive: true })
}

// actions
if (argv.id && argv.email && argv.name && argv.password)
{
  // if (await exists('./data'))
  // {
  //   await rm('./data', { recursive: true }) // 작업을 위하여 기존 데이터를 삭제한다.
  // }
  // check install data
  const installed = await checkData()
  if (installed)
  {
    message('exit', 'Installed')
    process.exit()
  }
  else
  {
    // 파라메터 정보로 곧장 설치하는 모드
    await createDirectories()
    await createDatabase()
    await addAccount({
      id: argv.id,
      email: argv.email,
      name: argv.name,
      password: argv.password,
    })
    await setupPreference()
  }
}
else
{
  // 직접 정보를 입력하고 설치하는 모드
  await confirm()
  const installed = await checkData()
  if (installed) await confirmUninstall()
  message('run', 'Checking data.')
  const user = await inputUserAccount()
  await createDirectories()
  await createDatabase()
  await addAccount(user)
  await setupPreference()
}

message('exit', 'Complete install')
if (db) db.close()
process.exit()
