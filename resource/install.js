import { exit } from 'node:process'
import { rm, mkdir, exists } from 'node:fs/promises'
import { Database } from 'bun:sqlite'
import { randomBytes } from 'node:crypto'
import minimist from 'minimist'
import { message, prompt } from './libs.js'
import { dataPath } from '../server/libs/consts.js'
import { hashPassword } from '../server/libs/strings.js'
import { verifyEmail } from '../global/strings.js'
import { userPreference } from '../global/defaults.js'

const argv = minimist(process.argv.slice(2))
const paths = {
  seedDb: `resource/seed.sql`,
  db: `${dataPath}/db.sqlite`,
  env: '.env.local',
}
const pathList = [
  `${dataPath}/original`,
  `${dataPath}/cover`,
  `${dataPath}/cache`,
  `${dataPath}/logs`,
  `${dataPath}/tmp`,
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
    exit()
  }
}

/**
 * check directories
 * @return {Promise<boolean>}
 */
async function checkData()
{
  const res = await Promise.all([
    ...(pathList.map(path => exists(path))),
    exists(paths.db),
  ])
  return res.includes(true) // 경로가 하나라도 만들어져 있으면 인스톨이 되어있다고 간주한다.
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
    exit()
  }
}

/**
 * 관리자 정보 입력받기
 * @return {Promise<object>}
 */
async function inputUserAccount()
{
  message('run', 'Enter admin information.')
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
    exit()
  }
}

/**
 * 관리자 계정 추가
 * @param {string} [user.email] 이메일 주소
 * @param {string} [user.name] 이름
 * @param {string} [user.password] 패스워드
 * @return {Promise<void>}
 */
async function addUser(user)
{
  const { email, name, password } = user
  const pref = JSON.stringify(userPreference) || '{}'
  try
  {
    const sql = `insert into user (email, name, password, json, mode, regdate) values (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    db.run(sql, [ email, name, hashPassword(String(password)), pref, 'ADMIN' ])
  }
  catch (e)
  {
    message('error', e.message)
    db.close()
    exit()
  }
  message('run', `You've entered your admin information.`)
}

async function updateEnv()
{
  function editField(src, key, value)
  {
    const checkRegex = new RegExp(`(?<=^${key}=)`, 'gm')
    if (checkRegex.test(src))
    {
      const regex = new RegExp(`(?<=^${key}=).*$`, 'gm')
      return src.replace(regex, value)
    }
    else
    {
      src += `\n${key}='${value}'`
      return src
    }
  }
  try
  {
    let env = Bun.file(paths.env)
    const existEnv = await env.exists()
    let text = existEnv ? await env.text() : ''
    text = editField(text, 'ACCESS_TOKEN_SECRET', randomBytes(16).toString('hex'))
    text = editField(text, 'REFRESH_TOKEN_SECRET', randomBytes(24).toString('hex'))
    await Bun.write(paths.env, text)
  }
  catch (e)
  {
    message('error', e.message)
    exit()
  }
}

async function removeData()
{
  const exist = await exists(dataPath)
  if (exist) await rm(dataPath, { recursive: true })
}

// actions
if (argv.email && argv.name && argv.password)
{
  const installed = await checkData()
  if (installed)
  {
    message('exit', 'Skip install')
    exit()
  }
  // 파라메터 정보로 곧장 설치하는 모드
  const user = {
    email: argv.email,
    name: argv.name,
    password: argv.password,
  }
  await createDirectories()
  await createDatabase()
  await addUser(user)
  await updateEnv()
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
  await addUser(user)
  await updateEnv()
}

message('exit', 'Complete install')
if (db) db.close()
exit()
