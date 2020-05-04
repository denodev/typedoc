// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />

declare namespace Deno {
  /** The current process id of the runtime.
   * @i18n 当前正在运行的进程 ID。 */
  export let pid: number;

  /** Reflects the `NO_COLOR` environment variable.
   * @i18n 显示环境变量 `NO_COLOR` 的值。
   *
   * See: https://no-color.org/
   * @i18n 参见：https://no-color.org/*/
  export let noColor: boolean;

  export interface TestDefinition {
    fn: () => void | Promise<void>;
    name: string;
    ignore?: boolean;
    disableOpSanitizer?: boolean;
    disableResourceSanitizer?: boolean;
  }

  /** Register a test which will be run when `deno test` is used on the command
   * line and the containing module looks like a test module, or explicitly
   * when `Deno.runTests` is used.  `fn` can be async if required.
   *
   * @i18n 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。如果需要， `fn` 可以是异步的。
   *
   *          import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *          Deno.test({
   *            name: "example test",
   *            fn(): void {
   *              assertEquals("world", "world");
   *            },
   *          });
   *
   *          Deno.test({
   *            name: "example ignored test",
   *            ignore: Deno.build.os === "win"
   *            fn(): void {
   *              // 仅在 Windows 机器上忽略这个测试。
   *            },
   *          });
   *
   *          Deno.test({
   *            name: "example async test",
   *            async fn() {
   *              const decoder = new TextDecoder("utf-8");
   *              const data = await Deno.readFile("hello_world.txt");
   *              assertEquals(decoder.decode(data), "Hello world")
   *            }
   *          });
   */
  export function test(t: TestDefinition): void;

  /** Register a test which will be run when `deno test` is used on the command
   * line and the containing module looks like a test module, or explicitly
   * when `Deno.runTests` is used
   *
   * @i18n 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。
   *
   *        import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *        Deno.test(function myTestFunction():void {
   *          assertEquals("hello", "hello");
   *        });
   *
   *        Deno.test(async function myAsyncTestFunction():Promise<void> {
   *          const decoder = new TextDecoder("utf-8");
   *          const data = await Deno.readFile("hello_world.txt");
   *          assertEquals(decoder.decode(data), "Hello world")
   *        });
   **/
  export function test(fn: () => void | Promise<void>): void;

  /** Register a test which will be run when `deno test` is used on the command
   * line and the containing module looks like a test module, or explicitly
   * when `Deno.runTests` is used
   *
   * @i18n 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。
   *
   *        import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *        Deno.test("My test description", ():void => {
   *          assertEquals("hello", "hello");
   *        });
   *
   *        Deno.test("My async test description", async ():Promise<void> => {
   *          const decoder = new TextDecoder("utf-8");
   *          const data = await Deno.readFile("hello_world.txt");
   *          assertEquals(decoder.decode(data), "Hello world")
   *        });
   * */
  export function test(name: string, fn: () => void | Promise<void>): void;

  export interface TestMessage {
    start?: {
      tests: TestDefinition[];
    };
    testStart?: {
      [P in keyof TestDefinition]: TestDefinition[P];
    };
    testEnd?: {
      name: string;
      status: "passed" | "failed" | "ignored";
      duration: number;
      error?: Error;
    };
    end?: {
      filtered: number;
      ignored: number;
      measured: number;
      passed: number;
      failed: number;
      duration: number;
      results: Array<TestMessage["testEnd"] & {}>;
    };
  }

  export interface RunTestsOptions {
    /** If `true`, Deno will exit with status code 1 if there was
     * test failure. Defaults to `true`.
     * @i18n 如果为 `true`，当测试失败时 Deno 将以状态码 1 退出。默认为 `true`。*/
    exitOnFail?: boolean;
    /** If `true`, Deno will exit upon first test failure. Defaults to `false`.
     * @i18n 如果为 `true`，Deno 将在第一次测试失败后退出。默认值为 `false`。*/
    failFast?: boolean;
    /** String or RegExp used to filter test to run. Only test with names
     * matching provided `String` or `RegExp` will be run.
     * @i18n 用于筛选要运行的测试的字符串或正则表达式。只有当测试名称与提供的 `String` 或 `RegExp` 相匹配时才会运行。*/
    filter?: string | RegExp;
    /** String or RegExp used to skip tests to run. Tests with names
     * matching provided `String` or `RegExp` will not be run.
     * @i18n 用于跳过要运行的测试的字符串或正则表达式。当测试名称与提供的 `String` 或 `RegExp` 相匹配时将不会运行。*/
    skip?: string | RegExp;
    /** Disable logging of the results. Defaults to `false`.
     * @i18n 禁用记录结果. 默认值为 `false`。*/
    disableLog?: boolean;
    /** If true, report results to the console as is done for `deno test`. Defaults to `true`.
     * @i18n 如果为 `true`，将 `deno test` 完成的结果输出到控制台。默认值为 `true`。*/
    reportToConsole?: boolean;
    /** Called for each message received from the test run.
     * @i18n 回调从测试运行收到的每个消息。*/
    onMessage?: (message: TestMessage) => void | Promise<void>;
  }

  /** Run any tests which have been registered via `Deno.test()`. Always resolves
   * asynchronously.
   *
   * @i18n 运行所有通过 `Deno.test()` 注册的测试。始终异步 resolve。
   *
   *        // 注册一个测试。
   *        Deno.test({
   *          name: "example test",
   *          fn(): void {
   *            assertEquals("world", "world");
   *            assertEquals({ hello: "world" }, { hello: "world" });
   *          },
   *        });
   *
   *        // 运行所有已经注册过的测试。
   *        const runInfo = await Deno.runTests();
   *        console.log(runInfo.duration);  // all tests duration, e.g. "5" (in ms)
   *        console.log(runInfo.stats.passed);  //e.g. 1
   *        console.log(runInfo.results[0].name);  //e.g. "example test"
   */
  export function runTests(
    opts?: RunTestsOptions
  ): Promise<TestMessage["end"]> & {};

  /** Returns an array containing the 1, 5, and 15 minute load averages. The
   * load average is a measure of CPU and IO utilization of the last one, five,
   * and 15 minute periods expressed as a fractional number.  Zero means there
   * is no load. On Windows, the three values are always the same and represent
   * the current load, not the 1, 5 and 15 minute load averages.
   *
   * @i18n 返回 1 分钟、5 分钟和 15 分钟平均负载的数组。
   * 平均负载是对最后 1 分钟、5 分钟和 15 分钟的 CPU 以及 IO 利用率的度量，以分数表示。
   * `0` 表示没有负载。
   * 在 Windows 上，这 3 个值始终相同，代表当前负载，而不是 1 分钟、5 分钟和 15 分钟的平均负载。
   *
   *       console.log(Deno.loadavg());  //e.g. [ 0.71, 0.44, 0.44 ]
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。
   */
  export function loadavg(): number[];

  /** Get the `hostname` of the machine the Deno process is running on.
   * @i18n 获取 Deno 进程所在的计算机主机名(`hostname`)。
   *
   *       console.log(Deno.hostname());
   *
   *  Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。
   */
  export function hostname(): string;

  /** Returns the release version of the Operating System.
   * @i18n 返回操作系统的发行版本。
   *
   *       console.log(Deno.osRelease());
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。
   */
  export function osRelease(): string;

  /** Exit the Deno process with optional exit code. If no exit code is supplied
   * then Deno will exit with return code of 0.
   * @i18n 退出 Deno 进程，可以指定退出码，若无则为 0。
   *
   *       Deno.exit(5);
   */
  export function exit(code?: number): never;

  /** Returns a snapshot of the environment variables at invocation. Changing a
   * property in the object will set that variable in the environment for the
   * process. The environment object will only accept `string`s as values.
   * @i18n 返回调用时环境变量的快照。如果更改环境变量对象的属性，则会在进程的环境中设置该属性。
   * 环境变量对象只接受 `string` 类型的值。
   *
   *       const myEnv = Deno.env();
   *       console.log(myEnv.SHELL);
   *       myEnv.TEST_VAR = "HELLO";
   *       const newEnv = Deno.env();
   *       console.log(myEnv.TEST_VAR === newEnv.TEST_VAR);  //outputs "true"
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。*/
  export function env(): {
    [index: string]: string;
  };

  /** Retrieve the value of an environment variable. Returns undefined if that
   * key doesn't exist.
   * @i18n 获取环境变量的值。如果 `key` 不存在，则返回 `undefined`。
   *
   *       console.log(Deno.env("HOME"));  //e.g. outputs "/home/alice"
   *       console.log(Deno.env("MADE_UP_VAR"));  //outputs "Undefined"
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。*/
  export function env(key: string): string | undefined;

  /** **UNSTABLE** */
  export type DirKind =
    | "home"
    | "cache"
    | "config"
    | "executable"
    | "data"
    | "data_local"
    | "audio"
    | "desktop"
    | "document"
    | "download"
    | "font"
    | "picture"
    | "public"
    | "template"
    | "tmp"
    | "video";

  /**
   * **UNSTABLE**: Currently under evaluation to decide if method name `dir` and
   * parameter type alias name `DirKind` should be renamed.
   * @i18n **不稳定**: 当前正在评估中，以确定是否应重命名方法名 `dir` 和参数类型 `DirKind`。
   *
   * Returns the user and platform specific directories.
   * @i18n 返回特定于用户和平台的目录。
   *
   *       const homeDirectory = Deno.dir("home");
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。
   *
   * Returns `null` if there is no applicable directory or if any other error
   * occurs.
   * @i18n 如果没有适用的目录或发生任何其他错误，则返回 `null`。
   *
   * Argument values: `"home"`, `"cache"`, `"config"`, `"executable"`, `"data"`,
   * `"data_local"`, `"audio"`, `"desktop"`, `"document"`, `"download"`,
   * `"font"`, `"picture"`, `"public"`, `"template"`, `"tmp"`, `"video"`
   * @i18n 参数值包含：`"home"`, `"cache"`, `"config"`, `"executable"`, `"data"`,
   * `"data_local"`, `"audio"`, `"desktop"`, `"document"`, `"download"`,
   * `"font"`, `"picture"`, `"public"`, `"template"`, `"tmp"`, `"video"`
   *
   * `"home"`
   *
   * |平台      | 值                                       | 示例                    |
   * | ------- | -----------------------------------------| -----------------------|
   * | Linux   | `$HOME`                                  | /home/alice            |
   * | macOS   | `$HOME`                                  | /Users/alice           |
   * | Windows | `{FOLDERID_Profile}`                     | C:\Users\Alice         |
   *
   * `"cache"`
   *
   * |平台      | 值                                  | 示例                          |
   * | ------- | ----------------------------------- | ---------------------------- |
   * | Linux   | `$XDG_CACHE_HOME` or `$HOME`/.cache | /home/alice/.cache           |
   * | macOS   | `$HOME`/Library/Caches              | /Users/Alice/Library/Caches  |
   * | Windows | `{FOLDERID_LocalAppData}`           | C:\Users\Alice\AppData\Local |
   *
   * `"config"`
   *
   * |平台      | 值                                    | 示例                              |
   * | ------- | ------------------------------------- | -------------------------------- |
   * | Linux   | `$XDG_CONFIG_HOME` or `$HOME`/.config | /home/alice/.config              |
   * | macOS   | `$HOME`/Library/Preferences           | /Users/Alice/Library/Preferences |
   * | Windows | `{FOLDERID_RoamingAppData}`           | C:\Users\Alice\AppData\Roaming   |
   *
   * `"executable"`
   *
   * |平台      | 值                                                              | 示例                    |
   * | ------- | --------------------------------------------------------------- | -----------------------|
   * | Linux   | `XDG_BIN_HOME` or `$XDG_DATA_HOME`/../bin or `$HOME`/.local/bin | /home/alice/.local/bin |
   * | macOS   | -                                                               | -                      |
   * | Windows | -                                                               | -                      |
   *
   * `"data"`
   *
   * |平台      | 值                                       | 示例                                      |
   * | ------- | ---------------------------------------- | ---------------------------------------- |
   * | Linux   | `$XDG_DATA_HOME` or `$HOME`/.local/share | /home/alice/.local/share                 |
   * | macOS   | `$HOME`/Library/Application Support      | /Users/Alice/Library/Application Support |
   * | Windows | `{FOLDERID_RoamingAppData}`              | C:\Users\Alice\AppData\Roaming           |
   *
   * `"data_local"`
   *
   * |平台      | 值                                       | 示例                                      |
   * | ------- | ---------------------------------------- | ---------------------------------------- |
   * | Linux   | `$XDG_DATA_HOME` or `$HOME`/.local/share | /home/alice/.local/share                 |
   * | macOS   | `$HOME`/Library/Application Support      | /Users/Alice/Library/Application Support |
   * | Windows | `{FOLDERID_LocalAppData}`                | C:\Users\Alice\AppData\Local             |
   *
   * `"audio"`
   *
   * |平台      | 值                 | 示例                  |
   * | ------- | ------------------ | -------------------- |
   * | Linux   | `XDG_MUSIC_DIR`    | /home/alice/Music    |
   * | macOS   | `$HOME`/Music      | /Users/Alice/Music   |
   * | Windows | `{FOLDERID_Music}` | C:\Users\Alice\Music |
   *
   * `"desktop"`
   *
   * |平台      | 值                   | 示例                    |
   * | ------- | -------------------- | ---------------------- |
   * | Linux   | `XDG_DESKTOP_DIR`    | /home/alice/Desktop    |
   * | macOS   | `$HOME`/Desktop      | /Users/Alice/Desktop   |
   * | Windows | `{FOLDERID_Desktop}` | C:\Users\Alice\Desktop |
   *
   * `"document"`
   *
   * |平台      | 值                     | 示例                      |
   * | ------- | ---------------------- | ------------------------ |
   * | Linux   | `XDG_DOCUMENTS_DIR`    | /home/alice/Documents    |
   * | macOS   | `$HOME`/Documents      | /Users/Alice/Documents   |
   * | Windows | `{FOLDERID_Documents}` | C:\Users\Alice\Documents |
   *
   * `"download"`
   *
   * |平台      | 值                     | 示例                      |
   * | ------- | ---------------------- | ------------------------ |
   * | Linux   | `XDG_DOWNLOAD_DIR`     | /home/alice/Downloads    |
   * | macOS   | `$HOME`/Downloads      | /Users/Alice/Downloads   |
   * | Windows | `{FOLDERID_Downloads}` | C:\Users\Alice\Downloads |
   *
   * `"font"`
   *
   * |平台      | 值                                                   | 示例                           |
   * | ------- | ---------------------------------------------------- | ------------------------------ |
   * | Linux   | `$XDG_DATA_HOME`/fonts or `$HOME`/.local/share/fonts | /home/alice/.local/share/fonts |
   * | macOS   | `$HOME/Library/Fonts`                                | /Users/Alice/Library/Fonts     |
   * | Windows | –                                                    | –                              |
   *
   * `"picture"`
   *
   * |平台      | 值                    | 示例                     |
   * | ------- | --------------------- | ----------------------- |
   * | Linux   | `XDG_PICTURES_DIR`    | /home/alice/Pictures    |
   * | macOS   | `$HOME`/Pictures      | /Users/Alice/Pictures   |
   * | Windows | `{FOLDERID_Pictures}` | C:\Users\Alice\Pictures |
   *
   * `"public"`
   *
   * |平台      | 值                    | 示例                 |
   * | ------- | --------------------- | ------------------- |
   * | Linux   | `XDG_PUBLICSHARE_DIR` | /home/alice/Public  |
   * | macOS   | `$HOME`/Public        | /Users/Alice/Public |
   * | Windows | `{FOLDERID_Public}`   | C:\Users\Public     |
   *
   * `"template"`
   *
   * |平台      | 值                     | 示例                                                       |
   * | ------- | ---------------------- | ---------------------------------------------------------- |
   * | Linux   | `XDG_TEMPLATES_DIR`    | /home/alice/Templates                                      |
   * | macOS   | –                      | –                                                          |
   * | Windows | `{FOLDERID_Templates}` | C:\Users\Alice\AppData\Roaming\Microsoft\Windows\Templates |
   *
   * `"tmp"`
   *
   * |平台      | 值                     | 示例                                                        |
   * | ------- | ---------------------- | ---------------------------------------------------------- |
   * | Linux   | `TMPDIR`               | /tmp                                                       |
   * | macOS   | `TMPDIR`               | /tmp                                                       |
   * | Windows | `{TMP}`                | C:\Users\Alice\AppData\Local\Temp                          |
   *
   * `"video"`
   *
   * |平台      | 值                  | 示例                   |
   * | ------- | ------------------- | --------------------- |
   * | Linux   | `XDG_VIDEOS_DIR`    | /home/alice/Videos    |
   * | macOS   | `$HOME`/Movies      | /Users/Alice/Movies   |
   * | Windows | `{FOLDERID_Videos}` | C:\Users\Alice\Videos |
   *
   */
  export function dir(kind: DirKind): string | null;

  /**
   * Returns the path to the current deno executable.
   * @i18n 返回当前 deno 可执行文件的路径。
   *
   *       console.log(Deno.execPath());  //e.g. "/home/alice/.local/bin/deno"
   *
   * Requires `allow-env` permission.
   * @i18n 需要 `allow-env` 权限。
   */
  export function execPath(): string;

  /**
   * **UNSTABLE**: Currently under evaluation to decide if explicit permission is
   * required to get the value of the current working directory.
   * @i18n **不稳定**: 获取当前工作目录是否需要明确的权限，目前正在评估中。
   *
   * Return a string representing the current working directory.
   * @i18n 返回当前工作目录的字符串。
   *
   * If the current directory can be reached via multiple paths (due to symbolic
   * links), `cwd()` may return any one of them.
   * @i18n 如果当前目录可以通过多个路径访问（由于符号链接导致），可能会返回其中任意一个。
   *
   *       const currentWorkingDirectory = Deno.cwd();
   *
   * Throws `Deno.errors.NotFound` if directory not available.
   * @i18n 如果目录不存在，则抛出 `Deno.errors.NotFound`。
   */
  export function cwd(): string;

  /**
   * **UNSTABLE**: Currently under evaluation to decide if explicit permission is
   * required to change the current working directory.
   * @i18n **不稳定**: 更改当前工作目录是否需要明确的权限，目前正在评估中。
   *
   * Change the current working directory to the specified path.
   * @i18n 将当前工作目录更改为指定路径。
   *
   *       Deno.chdir("/home/userA");
   *       Deno.chdir("../userB");
   *       Deno.chdir("C:\\Program Files (x86)\\Java");
   *
   * Throws `Deno.errors.NotFound` if directory not found.
   * Throws `Deno.errors.PermissionDenied` if the user does not have access
   * rights
   * @i18n 如果目录未被找到，则抛出 `Deno.errors.NotFound` 。
   * 如果用户没有访问权限，则抛出 `Deno.errors.PermissionDenied` 。
   */
  export function chdir(directory: string): void;

  /**
   * **UNSTABLE**: New API, yet to be vetted.  This API is under consideration to
   * determine if permissions are required to call it.
   * @i18n **不稳定**: 新 API，没有经过审查。正在考虑调用此 API 时，是否需要申请权限。
   *
   * Retrieve the process umask.  If `mask` is provided, sets the process umask.
   * This call always returns what the umask was before the call.
   * @i18n 获取进程权限掩码。如果提供 `mask`，则设置进程权限掩码。
   * 此函数始终返回调用前的权限掩码。
   *
   *        console.log(Deno.umask());  //e.g. 18 (0o022)
   *        const prevUmaskValue = Deno.umask(0o077);  //e.g. 18 (0o022)
   *        console.log(Deno.umask());  //e.g. 63 (0o077)
   *
   * NOTE:  This API is not implemented on Windows
   * @i18n 注意: 此 API 未在 Windows 平台实现。
   */
  export function umask(mask?: number): number;

  /** **UNSTABLE**: might move to `Deno.symbols`.
   * @i18n **不稳定**: 可能会移动到 `Deno.symbols`。*/
  export const EOF: unique symbol;
  export type EOF = typeof EOF;

  /** **UNSTABLE**: might remove `"SEEK_"` prefix. Might not use all-caps.
   * @i18n **不稳定**: 可能会移除 `"SEEK_"` 前缀。可能不使用全大写。*/
  export enum SeekMode {
    SEEK_START = 0,
    SEEK_CURRENT = 1,
    SEEK_END = 2,
  }

  /** **UNSTABLE**: might make `Reader` into iterator of some sort. */
  export interface Reader {
    /** Reads up to `p.byteLength` bytes into `p`. It resolves to the number of
     * bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
     * encountered. Even if `read()` resolves to `n` < `p.byteLength`, it may
     * use all of `p` as scratch space during the call. If some data is
     * available but not `p.byteLength` bytes, `read()` conventionally resolves
     * to what is available instead of waiting for more.
     * @i18n 最多读取 `p.byteLength` 个字节到p中，然后返回读取的字节数（`0 < n <= p.byteLength`），并在遇到任何错误时返回拒绝状态的回调函数。
     * 即使 `read()` 返回值为 `n < p.byteLength`，p也可能在调用期间被用作临时空间。
     * 如果有数据可用，但不存在 `p.byteLength`，`read()` 通常会返回可用值，而不是等待更多。
     *
     * When `read()` encounters end-of-file condition, it resolves to
     * `Deno.EOF` symbol.
     * @i18n 当 `read()` 遇到文件结束条件时，将返回 `Deno.EOF` 符号。
     *
     * When `read()` encounters an error, it rejects with an error.
     * @i18n 当 `read()` 遇到错误时，它会返回拒绝状态的回调函数，参数值为错误信息。
     *
     * Callers should always process the `n` > `0` bytes returned before
     * considering the `EOF`. Doing so correctly handles I/O errors that happen
     * after reading some bytes and also both of the allowed EOF behaviors.
     * @i18n 调用者应始终处理返回值为 `n > 0` 的情况，然后再考虑 `EOF`。
     * 应正确处理在读取一些字节以及两种被允许的EOF行为之后可能发生的 I/O 错误。
     *
     * Implementations should not retain a reference to `p`.
     * @i18n 实现不应保留对 `p` 的引用。
     */
    read(p: Uint8Array): Promise<number | EOF>;
  }

  export interface ReaderSync {
    /** Reads up to `p.byteLength` bytes into `p`. It resolves to the number
     * of bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
     * encountered. Even if `read()` returns `n` < `p.byteLength`, it may use
     * all of `p` as scratch space during the call. If some data is available
     * but not `p.byteLength` bytes, `read()` conventionally returns what is
     * available instead of waiting for more.
     * @i18n 最多读取 `p.byteLength` 个字节到p中，然后返回读取的字节数（`0 < n <= p.byteLength`），并在遇到任何错误时返回拒绝状态的回调函数。
     * 即使 `readSync()` 返回值为 `n < p.byteLength`，p也可能在调用期间被用作临时空间。
     * 如果有数据可用，但不存在 `p.byteLength`，`readSync()` 通常会返回可用值，而不是等待更多。
     *
     * When `readSync()` encounters end-of-file condition, it returns `Deno.EOF`
     * symbol.
     * @i18n 当 `readSync()` 遇到文件结束条件时，将返回 `Deno.EOF` 符号。
     *
     * When `readSync()` encounters an error, it throws with an error.
     * @i18n 当 `readSync()` 遇到错误时，它会返回拒绝状态的回调函数，参数值为错误信息。
     *
     * Callers should always process the `n` > `0` bytes returned before
     * considering the `EOF`. Doing so correctly handles I/O errors that happen
     * after reading some bytes and also both of the allowed EOF behaviors.
     * @i18n 调用者应始终处理返回值为 `n > 0` 的情况，然后再考虑 `EOF`。
     * 应正确处理在读取一些字节以及两种被允许的EOF行为之后可能发生的 I/O 错误。
     *
     * Implementations should not retain a reference to `p`.
     * @i18n 实现不应保留对 `p` 的引用。
     */
    readSync(p: Uint8Array): number | EOF;
  }

  export interface Writer {
    /** Writes `p.byteLength` bytes from `p` to the underlying data stream. It
     * resolves to the number of bytes written from `p` (`0` <= `n` <=
     * `p.byteLength`) or reject with the error encountered that caused the
     * write to stop early. `write()` must reject with a non-null error if
     * would resolve to `n` < `p.byteLength`. `write()` must not modify the
     * slice data, even temporarily.
     * @i18n 将 `p` 中的 `p.byteLength` 字节写入底层数据流。 它 resolve 时返回值为从 `p` 写入的
     * 字节数(`0` <= `n` <= `p.byteLength`），reject 时返回值为导致写入提前停止的错误。
     * 如果将要 resolve 一个 `n` < `p.byteLength` 的值时， `write()` 必须 reject，并且返回
     * 一个非空错误。`write()` 禁止修改分片数据，即使是临时修改。
     *
     * Implementations should not retain a reference to `p`.
     * @i18n 实现不应保留对 `p` 的引用。
     */
    write(p: Uint8Array): Promise<number>;
  }

  export interface WriterSync {
    /** Writes `p.byteLength` bytes from `p` to the underlying data
     * stream. It returns the number of bytes written from `p` (`0` <= `n`
     * <= `p.byteLength`) and any error encountered that caused the write to
     * stop early. `writeSync()` must throw a non-null error if it returns `n` <
     * `p.byteLength`. `writeSync()` must not modify the slice data, even
     * temporarily.
     * @i18n 将 `p` 中的 `p.byteLength` 字节写入底层数据流。它的返回值为从 `p` 写入的
     * 字节数(`0` <= `n` <= `p.byteLength`）或者导致写入提前停止的错误。
     * `writeSync()` 会抛出一个非空错误当返回值 `n` < `p.byteLength`。`writeSync()`
     * 禁止修改分片数据，即使是临时修改。
     *
     * Implementations should not retain a reference to `p`.
     * @i18n 实现不应保留对 `p` 的引用。
     */
    writeSync(p: Uint8Array): number;
  }

  export interface Closer {
    close(): void;
  }

  export interface Seeker {
    /** Seek sets the offset for the next `read()` or `write()` to offset,
     * interpreted according to `whence`: `SEEK_START` means relative to the
     * start of the file, `SEEK_CURRENT` means relative to the current offset,
     * and `SEEK_END` means relative to the end. Seek resolves to the new offset
     * relative to the start of the file.
     * @i18n 设置下一个 `read()` 或 `write()` 的偏移量，根据 `whence` 进行决定从哪个位置开始偏移：
     * `SEEK_START` 表示相对于文件开头，`SEEK_CURRENT` 表示相对于当前位置，`SEEK_END` 表示相对于文件末尾。
     * Seek 解析（resolve）的值为相对于文件开头的新偏移量。
     *
     * Seeking to an offset before the start of the file is an error. Seeking to
     * any positive offset is legal, but the behavior of subsequent I/O
     * operations on the underlying object is implementation-dependent.
     * It returns the number of cursor position.
     * @i18n 把偏移量设置到文件开始之前是错误的。
     * 设置任何正偏移都是合法的，但是对于之后的 I/O 操作的行为则取决于实现。
     * 它返回设置之后的偏移位置。
     */
    seek(offset: number, whence: SeekMode): Promise<number>;
  }

  export interface ReadCloser extends Reader, Closer {}
  export interface WriteCloser extends Writer, Closer {}
  export interface ReadSeeker extends Reader, Seeker {}
  export interface WriteSeeker extends Writer, Seeker {}
  export interface ReadWriteCloser extends Reader, Writer, Closer {}
  export interface ReadWriteSeeker extends Reader, Writer, Seeker {}

  /** Copies from `src` to `dst` until either `EOF` is reached on `src` or an
   * error occurs. It resolves to the number of bytes copied or rejects with
   * the first error encountered while copying.
   * @i18n 从 `src` 拷贝文件至 `dst`，拷贝至 `src` 的 `EOF` 或有异常出现时结束。
   * `copy()` 函数返回一个 `Promise`, 成功时 resolve 并返回拷贝的字节数，失败时 reject 并返回拷贝过程中的首个异常。
   *
   *       const source = await Deno.open("my_file.txt");
   *       const buffer = new Deno.Buffer()
   *       const bytesCopied1 = await Deno.copy(Deno.stdout, source);
   *       const bytesCopied2 = await Deno.copy(buffer, source);
   *
   * Because `copy()` is defined to read from `src` until `EOF`, it does not
   * treat an `EOF` from `read()` as an error to be reported.
   * @i18n 因为 `copy()` 函数在读到 `EOF` 时停止，所以不会将 `EOF` 视为异常（区别于 `read()` 函数）。
   *
   * @param dst The destination to copy to
   * @param_i18n dst 需要拷贝至的目标位置
   * @param src The source to copy from
   * @param_i18n src 拷贝的源位置
   */
  export function copy(dst: Writer, src: Reader): Promise<number>;

  /** Turns a Reader, `r`, into an async iterator.
   * @i18n 将 Reader 对象 (`r`) 转换为异步迭代器。
   *
   *      for await (const chunk of toAsyncIterator(reader)) {
   *        console.log(chunk);
   *      }
   */
  export function toAsyncIterator(r: Reader): AsyncIterableIterator<Uint8Array>;

  /** Synchronously open a file and return an instance of `Deno.File`.  The
   * file does not need to previously exist if using the `create` or `createNew`
   * open options.  It is the callers responsibility to close the file when finished
   * with it.
   * @i18n 用同步方式打开一个文件并返回一个 `Deno.File` 实例。如果使用了 `create` 或 `createNew`配置项
   * 文件可以不需要预先存在。调用者应该在完成后关闭文件。
   *
   *       const file = Deno.openSync("/foo/bar.txt", { read: true, write: true });
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * Requires `allow-read` and/or `allow-write` permissions depending on options.
   * @i18n 根据不同的配置需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function openSync(path: string, options?: OpenOptions): File;

  /** Synchronously open a file and return an instance of `Deno.File`.  The file
   * may be created depending on the mode passed in.  It is the callers responsibility
   * to close the file when finished with it.
   * @i18n 用同步方式打开一个文件并返回一个 `Deno.File` 实例。根据传入的模式，可以创建文件。
   * 调用者应该在完成后关闭文件。
   *
   *       const file = Deno.openSync("/foo/bar.txt", "r");
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * Requires `allow-read` and/or `allow-write` permissions depending on openMode.
   * @i18n 根据不同的打开模式需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function openSync(path: string, openMode?: OpenMode): File;

  /** Open a file and resolve to an instance of `Deno.File`.  The
   * file does not need to previously exist if using the `create` or `createNew`
   * open options.  It is the callers responsibility to close the file when finished
   * with it.
   * @i18n 打开一个文件并异步返回一个 `Deno.File` 实例。如果使用了 `create` 或 `createNew`配置项
   * 文件可以不需要预先存在。调用者应该在完成后关闭文件。
   *
   *       const file = await Deno.open("/foo/bar.txt", { read: true, write: true });
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * Requires `allow-read` and/or `allow-write` permissions depending on options.
   * @i18n 根据不同的选项需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function open(path: string, options?: OpenOptions): Promise<File>;

  /** Open a file and resolve to an instance of `Deno.File`.  The file may be
   * created depending on the mode passed in.  It is the callers responsibility
   * to close the file when finished with it.
   * @i18n 打开一个文件并异步返回一个 `Deno.File` 实例。根据传入的模式，可以创建文件。
   * 调用者应该在完成后关闭文件。
   *
   *       const file = await Deno.open("/foo/bar.txt", "w+");
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * Requires `allow-read` and/or `allow-write` permissions depending on openMode.
   * @i18n 根据不同的打开模式需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function open(path: string, openMode?: OpenMode): Promise<File>;

  /** Creates a file if none exists or truncates an existing file and returns
   *  an instance of `Deno.File`.
   * @i18n 创建文件并返回一个 `Deno.File` 实例，如果文件已存在则进行覆盖。
   *
   *       const file = Deno.createSync("/foo/bar.txt");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。
   */
  export function createSync(path: string): File;

  /** Creates a file if none exists or truncates an existing file and resolves to
   *  an instance of `Deno.File`.
   * @i18n 创建文件并异步返回一个 `Deno.File` 实例，如果文件已存在则进行覆盖。
   *
   *       const file = await Deno.create("/foo/bar.txt");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。
   */
  export function create(path: string): Promise<File>;

  /** Synchronously read from a resource ID (`rid`) into an array buffer (`buffer`).
   * @i18n 同步地从资源ID (`rid`) 读取内容，并写入到数组缓冲区 (`buffer`)。
   *
   * Returns either the number of bytes read during the operation or End Of File
   * (`Symbol(EOF)`) if there was nothing to read.
   * @i18n 如果没有要读取的内容，返回值为操作期间读取的字节数，或者文件结尾（`Symbol（EOF）`）。
   *
   *      // 如果 "/foo/bar.txt" 文件里面有 "hello world":
   *      const file = Deno.openSync("/foo/bar.txt");
   *      const buf = new Uint8Array(100);
   *      const numberOfBytesRead = Deno.readSync(file.rid, buf); // 11 bytes
   *      const text = new TextDecoder().decode(buf);  // "hello world"
   *      Deno.close(file.rid);
   */
  export function readSync(rid: number, buffer: Uint8Array): number | EOF;

  /** Read from a resource ID (`rid`) into an array buffer (`buffer`).
   * @i18n 从资源ID (`rid`) 读取内容，并写入到数组缓冲区 (`buffer`)。
   *
   * Resolves to either the number of bytes read during the operation or End Of
   * File (`Symbol(EOF)`) if there was nothing to read.
   * @i18n 如果没有要读取的内容，返回值为操作期间读取的字节数，或者文件结尾（`Symbol（EOF）`）。
   *
   *      // 如果 "/foo/bar.txt" 文件里面有 "hello world":
   *      const file = await Deno.open("/foo/bar.txt");
   *      const buf = new Uint8Array(100);
   *      const numberOfBytesRead = await Deno.read(file.rid, buf); // 11 bytes
   *      const text = new TextDecoder().decode(buf);  // "hello world"
   *      Deno.close(file.rid);
   */
  export function read(rid: number, buffer: Uint8Array): Promise<number | EOF>;

  /** Synchronously write to the resource ID (`rid`) the contents of the array
   * buffer (`data`).
   * @i18n 同步地将数组缓冲区 (`data`) 的内容写入资源ID的所属文件 (`rid`) 。
   *
   * Returns the number of bytes written.
   * @i18n 返回写入的字节数。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world");
   *       const file = Deno.openSync("/foo/bar.txt");
   *       const bytesWritten = Deno.writeSync(file.rid, data); // 11
   *       Deno.close(file.rid);
   */
  export function writeSync(rid: number, data: Uint8Array): number;

  /** Write to the resource ID (`rid`) the contents of the array buffer (`data`).
   * @i18n 将数组缓冲区 (`data`) 的内容写入资源ID的所属文件 (`rid`) 。
   *
   * Resolves to the number of bytes written.
   * @i18n 解析为写入的字节数。
   *
   *      const encoder = new TextEncoder();
   *      const data = encoder.encode("Hello world");
   *      const file = await Deno.open("/foo/bar.txt");
   *      const bytesWritten = await Deno.write(file.rid, data); // 11
   *      Deno.close(file.rid);
   */
  export function write(rid: number, data: Uint8Array): Promise<number>;

  /** Synchronously seek a resource ID (`rid`) to the given `offset` under mode
   * given by `whence`.  The new position within the resource (bytes from the
   * start) is returned.
   * @i18n 同步方式，在给定查询模式 `whence` 和偏移量 `offset` 的情况下，查找指定的资源 ID（`rid`）。
   * 函数将解析并返回光标在资源中的新位置（从头开始的字节数）。
   *
   *        const file = Deno.openSync('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        Deno.writeSync(file.rid, new TextEncoder().encode("Hello world"));
   *        //advance cursor 6 bytes
   *        const cursorPosition = Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        file.readSync(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * The seek modes work as follows:
   * @i18n seek modes 的工作方式如下:
   *
   *        // 给定内容为 "Hello world" 的 file.rid 文件，该文件长度为 11 个字节。
   *        // 从文件开头移动 6 个字节
   *        console.log(Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START)); //"6"
   *        // 从当前位置再移动 2 个字节
   *        console.log(Deno.seekSync(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); //"8"
   *        // 从文件末尾向后移动 2 个字节
   *        console.log(Deno.seekSync(file.rid, -2, Deno.SeekMode.SEEK_END)); //"9" (e.g. 11-2)
   */
  export function seekSync(
    rid: number,
    offset: number,
    whence: SeekMode
  ): number;

  /** Seek a resource ID (`rid`) to the given `offset` under mode given by `whence`.
   * The call resolves to the new position within the resource (bytes from the start).
   * @i18n 在给定查询模式 `whence` 和偏移量 `offset` 的情况下，查找指定的资源 ID（`rid`）。
   * 函数将解析并返回光标在资源中的新位置（从头开始的字节数）。
   *
   *        const file = await Deno.open('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        await Deno.write(file.rid, new TextEncoder().encode("Hello world"));
   *        // 光标前进 6 个字节
   *        const cursorPosition = await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        await file.read(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * The seek modes work as follows:
   * @i18n seek modes 的工作方式如下:
   *
   *        // 给定内容为 "Hello world" 的 file.rid 文件，该文件长度为 11 个字节。
   *        // 从文件开头移动 6 个字节
   *        console.log(await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START)); //"6"
   *        // 从当前位置再移动 2 个字节
   *        console.log(await Deno.seek(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); //"8"
   *        // 从文件末尾向后移动 2 个字节
   *        console.log(await Deno.seek(file.rid, -2, Deno.SeekMode.SEEK_END)); //"9" (e.g. 11-2)
   */
  export function seek(
    rid: number,
    offset: number,
    whence: SeekMode
  ): Promise<number>;

  /** Close the given resource ID (rid) which has been previously opened, such
   * as via opening or creating a file.  Closing a file when you are finished
   * with it is important to avoid leaking resources.
   * @i18n 使用给定的资源 ID (rid) 来关闭先前创建或打开的文件。
   * 为避免资源泄露，事关重大，文件应当用完即关。
   *
   *      const file = await Deno.open("my_file.txt");
   *      // 与 "file" 对象一起使用
   *      Deno.close(file.rid);
   */
  export function close(rid: number): void;

  /** The Deno abstraction for reading and writing files.
   * @i18n 用于读取和写入文件的 Deno 抽象类。*/
  export class File
    implements
      Reader,
      ReaderSync,
      Writer,
      WriterSync,
      Seeker,
      Closer {
    readonly rid: number;
    constructor(rid: number);
    write(p: Uint8Array): Promise<number>;
    writeSync(p: Uint8Array): number;
    read(p: Uint8Array): Promise<number | EOF>;
    readSync(p: Uint8Array): number | EOF;
    seek(offset: number, whence: SeekMode): Promise<number>;
    seekSync(offset: number, whence: SeekMode): number;
    close(): void;
  }

  /** An instance of `Deno.File` for `stdin`.
   * @i18n 用于 `stdin` 的 `Deno.File` 实例。*/
  export const stdin: File;
  /** An instance of `Deno.File` for `stdout`.
   * @i18n 用于 `stdout` 的 `Deno.File` 实例。*/
  export const stdout: File;
  /** An instance of `Deno.File` for `stderr`.
   * @i18n 用于 `stderr` 的 `Deno.File` 实例。*/
  export const stderr: File;

  export interface OpenOptions {
    /** Sets the option for read access. This option, when `true`, means that the
     * file should be read-able if opened.
     * @i18n 设置读取访问权限的选项。
     * 当为 `true` 时，表示该文件在打开后即处于可读状态。*/
    read?: boolean;
    /** Sets the option for write access. This option, when `true`, means that
     * the file should be write-able if opened. If the file already exists,
     * any write calls on it will overwrite its contents, by default without
     * truncating it.
     * @i18n 设置写访问权限的选项。
     * 当为 `true` 时，表示该文件在打开时即处于可写状态。
     * 如果该文件已存在，则默认情况下，对该文件的任何写调用都将覆盖其内容，而不会截断该文件。*/
    write?: boolean;
    /**Sets the option for the append mode. This option, when `true`, means that
     * writes will append to a file instead of overwriting previous contents.
     * Note that setting `{ write: true, append: true }` has the same effect as
     * setting only `{ append: true }`.
     * @i18n 设置追加模式的选项。
     * 当为 `true` 时，表示写入将追加到文件中，而不是覆盖先前的内容。
     * 请注意，设置 `{ write: true, append: true }` 与仅设置 `{ append: true }` 具有相同的效果。*/
    append?: boolean;
    /** Sets the option for truncating a previous file. If a file is
     * successfully opened with this option set it will truncate the file to `0`
     * size if it already exists. The file must be opened with write access
     * for truncate to work.
     * @i18n 设置截断上一个文件的选项。
     * 如果使用此选项后成功打开了文件，则文件的长度将被截断为 `0`（如果已存在）。
     * 该文件必须具有写访问权限才能打开，才能进行截断。*/
    truncate?: boolean;
    /** Sets the option to allow creating a new file, if one doesn't already
     * exist at the specified path. Requires write or append access to be
     * used.
     * @i18n 设置选项以允许创建新文件（如果指定路径尚不存在）。
     * 需要使用写权限或追加权限。*/
    create?: boolean;
    /** Defaults to `false`. If set to `true`, no file, directory, or symlink is
     * allowed to exist at the target location. Requires write or append
     * access to be used. When createNew is set to `true`, create and truncate
     * are ignored.
     * @i18n 默认为 `false`。
     * 如果设置为 `true`，则在目标位置不允许存在文件、目录或符号链接。
     * 需要使用写权限或追加权限。
     * 当 createNew 设置为 `true` 时，create 和 truncate 被忽略。*/
    createNew?: boolean;
    /** Permissions to use if creating the file (defaults to `0o666`, before
     * the process's umask).
     * Ignored on Windows.
     * @i18n 创建文件时使用的权限（在进程调用 `umask` 之前默认为 `0o666`）。
     * 在 Windows 上此选项被忽略。*/
    mode?: number;
  }

  /** A set of string literals which specify how to open a file.
   * @i18n 一组字符串文本，用于指定如何打开文件。
   *
   * |Value |Description                                                                                       |
   * |------|--------------------------------------------------------------------------------------------------|
   * |`"r"` |Read-only. Default. Starts at beginning of file.                                                  |
   * |`"r+"`|Read-write. Start at beginning of file.                                                           |
   * |`"w"` |Write-only. Opens and truncates existing file or creates new one for writing only.                |
   * |`"w+"`|Read-write. Opens and truncates existing file or creates new one for writing and reading.         |
   * |`"a"` |Write-only. Opens existing file or creates new one. Each write appends content to the end of file.|
   * |`"a+"`|Read-write. Behaves like `"a"` and allows to read from file.                                      |
   * |`"x"` |Write-only. Exclusive create - creates new file only if one doesn't exist already.                |
   * |`"x+"`|Read-write. Behaves like `x` and allows reading from file.                                        |
   *
   * @i18n
   * |值    |描述                                                                                               |
   * |------|--------------------------------------------------------------------------------------------------|
   * |`"r"` |只读。默认值。从文件开头开始。                                                                         |
   * |`"r+"`|可读写。从文件开头开始。                                                                              |
   * |`"w"` |仅写入。打开并截取现有文件或者创建一个仅写入权限的新文件。                                                  |
   * |`"w+"`|可读写。打开并截取现有文件或者创建一个可读写权限的新文件。                                                  |
   * |`"a"` |仅写入。打开现有文件或者创建新文件。每次写入都会将内容追加到文件末尾。                                        |
   * |`"a+"`|可读写。行为类似于 `"a"` 并且允许从文件中读取。                                                          |
   * |`"x"` |仅写入。专属创建 - 仅在文件不存在时创建新文件。                                                           |
   * |`"x+"`|可读写。行为类似于 `"x"` 并且允许从文件中读取。                                                         |
   */
  export type OpenMode = "r" | "r+" | "w" | "w+" | "a" | "a+" | "x" | "x+";

  /** **UNSTABLE**: new API, yet to be vetted
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   *  Check if a given resource id (`rid`) is a TTY.
   * @i18n 检查指定的资源 id (`rid`) 是否为 TTY（终端）。
   *
   *       // 这个例子依赖于特定的操作系统和环境
   *       const nonTTYRid = Deno.openSync("my_file.txt").rid;
   *       const ttyRid = Deno.openSync("/dev/tty6").rid;
   *       console.log(Deno.isatty(nonTTYRid)); // false
   *       console.log(Deno.isatty(ttyRid)); // true
   *       Deno.close(nonTTYRid);
   *       Deno.close(ttyRid);
   */
  export function isatty(rid: number): boolean;

  /** **UNSTABLE**: new API, yet to be vetted
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Set TTY to be under raw mode or not. In raw mode, characters are read and
   * returned as is, without being processed. All special processing of
   * characters by the terminal is disabled, including echoing input characters.
   * Reading from a TTY device in raw mode is faster than reading from a TTY
   * device in canonical mode.
   * @i18n 设置终端是否为 raw 模式。
   * 在 raw 模式下，无需处理即可直接读取和返回字符。
   * 终端将禁止所有特殊的字符处理，包括回显输入字符。
   * 在 raw 模式下从终端设备读取的速度比在标准模式下更快。
   *
   *       Deno.setRaw(myTTY.rid, true);
   */
  export function setRaw(rid: number, mode: boolean): void;

  /** A variable-sized buffer of bytes with `read()` and `write()` methods.
   * @i18n 一个具有 `read()` 和 `write()` 方法大小可变的字节缓冲区。
   *
   * Based on [Go Buffer](https://golang.org/pkg/bytes/#Buffer).
   * @i18n 基于 [Go Buffer](https://golang.org/pkg/bytes/#Buffer)。*/
  export class Buffer implements Reader, ReaderSync, Writer, WriterSync {
    constructor(ab?: ArrayBuffer);
    /** Returns a slice holding the unread portion of the buffer.
     * @i18n 返回一个缓冲区未读部分的片段。
     *
     * The slice is valid for use only until the next buffer modification (that
     * is, only until the next call to a method like `read()`, `write()`,
     * `reset()`, or `truncate()`). The slice aliases the buffer content at
     * least until the next buffer modification, so immediate changes to the
     * slice will affect the result of future reads.
     * @i18n 该片段只在下一次缓冲区修改之前有效 (即, 只有在下一次调用像 `read()`, `write()`,
     * `reset()`, 或者 `truncate()` 这样的方法)。
     * 该片段会在下一次修改缓冲区内容之前将缓冲区内容进行别名处理 ,  所以立刻改变片段会影响未来读取的结果。*/
    bytes(): Uint8Array;
    /** Returns the contents of the unread portion of the buffer as a `string`.
     * @i18n 将缓冲区中未读部分的内容以 `string` 的形式返回。
     *
     * **Warning**: if multibyte characters are present when data is flowing
     * through the buffer, this method may result in incorrect strings due to a
     * character being split.
     * @i18n **警告**: 当数据流经缓冲区时存在多个字节, 这种方法可能会因为字符被拆分而导致字符串的结果错误。*/
    toString(): string;
    /** Returns whether the unread portion of the buffer is empty.
     * @i18n 返回缓冲区的未读部分是否为空。*/
    empty(): boolean;
    /** A read only number of bytes of the unread portion of the buffer.
     * @i18n 只读缓冲区未读部分的字节数。*/
    readonly length: number;
    /** The read only capacity of the buffer's underlying byte slice, that is,
     * the total space allocated for the buffer's data.
     * @i18n 缓冲区底层字节片段的只读容量，即为缓冲区数据分配的总空间。*/
    readonly capacity: number;
    /** Discards all but the first `n` unread bytes from the buffer but
     * continues to use the same allocated storage. It throws if `n` is
     * negative or greater than the length of the buffer.
     * @i18n 除了缓冲器中开头 `n` 个未读字节之外，其他的所有字节都丢弃，但是继续使用相同分配的存储空间。
     * 当 `n` 为负数或者大于缓冲区的长度, 则会抛出异常。*/
    truncate(n: number): void;
    /** Resets the buffer to be empty, but it retains the underlying storage for
     * use by future writes. `.reset()` is the same as `.truncate(0)`.
     * @i18n 将缓冲区重置为空，但它保留了底层存储供未来写入时使用，`.reset()` 与 `.truncate(0)` 相同。*/
    reset(): void;
    /** Reads the next `p.length` bytes from the buffer or until the buffer is
     * drained. Returns the number of bytes read. If the buffer has no data to
     * return, the return is `Deno.EOF`.
     * @i18n 在缓冲区中读取下一个 `p.length` 字节，或直到缓冲区用完为止。
     * 返回只读的字节数。当缓冲区没有数据返回，则返回值为 `Deno.EOF`。*/
    readSync(p: Uint8Array): number | EOF;
    /** Reads the next `p.length` bytes from the buffer or until the buffer is
     * drained. Resolves to the number of bytes read. If the buffer has no
     * data to return, resolves to `Deno.EOF`.
     * @i18n 在缓冲区中读取下一个 `p.length` 字节，或直到缓冲区用完为止。
     * 解析读取的字节数。当缓冲区没有数据返回，则解析为 `Deno.EOF`。*/
    read(p: Uint8Array): Promise<number | EOF>;
    writeSync(p: Uint8Array): number;
    write(p: Uint8Array): Promise<number>;
    /** Grows the buffer's capacity, if necessary, to guarantee space for
     * another `n` bytes. After `.grow(n)`, at least `n` bytes can be written to
     * the buffer without another allocation. If `n` is negative, `.grow()` will
     * throw. If the buffer can't grow it will throw an error.
     * @i18n 增加缓冲区的容量，必要时保证另一个 `n` 字节的空间。
     * 在 `.grow(n)` 之后，至少可以将 `n` 个字节写到缓冲区中而不需要另外分配。
     * 若 `n` 为负数，`.grow()` 将抛出异常。
     * 当缓冲区不能增加的时候会抛出错误。
     *
     * Based on Go Lang's
     * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow).
     * @i18n 基于 Go Lang 的
     * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow)。*/
    grow(n: number): void;
    /** Reads data from `r` until `Deno.EOF` and appends it to the buffer,
     * growing the buffer as needed. It resolves to the number of bytes read.
     * If the buffer becomes too large, `.readFrom()` will reject with an error.
     * @i18n 从 `r` 读取数据直到 `Deno.EOF`，并将其附加到缓冲区，根据需要扩展缓冲区。
     * 解析读取的字节数。 如果缓冲区过大，`.readFrom()` 将会 reject 一个错误。
     *
     * Based on Go Lang's
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom).
     * @i18n 基于 Go Lang 的
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom)。*/
    readFrom(r: Reader): Promise<number>;
    /** Reads data from `r` until `Deno.EOF` and appends it to the buffer,
     * growing the buffer as needed. It returns the number of bytes read. If the
     * buffer becomes too large, `.readFromSync()` will throw an error.
     * @i18n 从 `r` 读取数据直到 `Deno.EOF`，并将其附加到缓冲区，根据需要扩展缓冲区。
     * 返回读取的字节数，如果缓冲区过大，`.readFromSync()` 将会抛出错误。
     *
     * Based on Go Lang's
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom).
     * @i18n 基于 Go Lang 的
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom)。*/
    readFromSync(r: ReaderSync): number;
  }

  /** Read Reader `r` until end of file (`Deno.EOF`) and resolve to the content
   * as `Uint8Array`.
   * @i18n 读取 Reader `r` 直到文件的末尾 (`Deno.EOF`)，返回文件的内容，以 `Uint8Array` 表示。
   *
   *       // Example：从 stdin 读取
   *       const stdinContent = await Deno.readAll(Deno.stdin);
   *
   *       // Example：从文件读取
   *       const file = await Deno.open("my_file.txt", {read: true});
   *       const myFileContent = await Deno.readAll(file);
   *       Deno.close(file.rid);
   *
   *       // Example：从 buffer 读取
   *       const myData = new Uint8Array(100);
   *       // ... 此处省略了填充 myData 数组的代码
   *       const reader = new Deno.Buffer(myData.buffer as ArrayBuffer);
   *       const bufferContent = await Deno.readAll(reader);
   */
  export function readAll(r: Reader): Promise<Uint8Array>;

  /** Synchronously reads Reader `r` until end of file (`Deno.EOF`) and returns
   * the content as `Uint8Array`.
   * @i18n 同步地读取 Reader `r` 直到文件的末尾 (`Deno.EOF`)，返回文件的内容，以 `Uint8Array` 表示。
   *
   *       // Example：从 stdin 读取
   *       const stdinContent = Deno.readAllSync(Deno.stdin);
   *
   *       // Example：从文件读取
   *       const file = Deno.openSync("my_file.txt", {read: true});
   *       const myFileContent = Deno.readAllSync(file);
   *       Deno.close(file.rid);
   *
   *       // Example：从 buffer 读取
   *       const myData = new Uint8Array(100);
   *       //... 此处省略了填充 myData 数组的代码
   *       const reader = new Deno.Buffer(myData.buffer as ArrayBuffer);
   *       const bufferContent = Deno.readAllSync(reader);
   */
  export function readAllSync(r: ReaderSync): Uint8Array;

  /** Write all the content of the array buffer (`arr`) to the writer (`w`).
   * @i18n 将所有 Array Buffer （`arr`）中的的内容写入到对象 （`w`） 中。
   *
   *       // 举例：写入到 stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       await Deno.writeAll(Deno.stdout, contentBytes);
   *
   *       // 举例：写入到文件
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = await Deno.open('test.file', {write: true});
   *       await Deno.writeAll(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       // 举例：写入到 Buffer 对象
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const writer = new Deno.Buffer();
   *       await Deno.writeAll(writer, contentBytes);
   *       console.log(writer.bytes().length);  // 11
   */
  export function writeAll(w: Writer, arr: Uint8Array): Promise<void>;

  /** Synchronously write all the content of the array buffer (`arr`) to the
   * writer (`w`).
   * @i18n 将所有 Array Buffer （`arr`）中的的内容同步写入到对象 （`w`） 中。
   *
   *       // 举例：写入到 stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       Deno.writeAllSync(Deno.stdout, contentBytes);
   *
   *       // 举例：写入到文件
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = Deno.openSync('test.file', {write: true});
   *       Deno.writeAllSync(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       // 举例：写入到 Buffer 对象
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const writer = new Deno.Buffer();
   *       Deno.writeAllSync(writer, contentBytes);
   *       console.log(writer.bytes().length);  // 11
   */
  export function writeAllSync(w: WriterSync, arr: Uint8Array): void;

  export interface MkdirOptions {
    /** Defaults to `false`. If set to `true`, means that any intermediate
     * directories will also be created (as with the shell command `mkdir -p`).
     * Intermediate directories are created with the same permissions.
     * When recursive is set to `true`, succeeds silently (without changing any
     * permissions) if a directory already exists at the path, or if the path
     * is a symlink to an existing directory.
     * @i18n 默认为 `false`。
     * 如果设置为 `true`，则意味着还将创建所有中间目录（如 shell 命令 `mkdir -p` 那样）。
     * 使用相同的权限创建中间目录。
     * 当设置为 `true` 时，如果路径中已经存在目录，或者该路径是到现有目录的符号链接，则会静默地操作成功（不更改任何权限）。*/
    recursive?: boolean;
    /** Permissions to use when creating the directory (defaults to `0o777`,
     * before the process's umask).
     * Ignored on Windows.
     * @i18n 创建目录时使用的权限（在调用 `umask` 之前，默认值为 `0o777`）。在 Windows 上被忽略。*/
    mode?: number;
  }

  /** Synchronously creates a new directory with the specified path.
   * @i18n 同步地在指定路径下创建一个新的目录。
   *
   *       Deno.mkdirSync("new_dir");
   *       Deno.mkdirSync("nested/directories", { recursive: true });
   *       Deno.mkdirSync("restricted_access_dir", { mode: 0o700 });
   *
   * Defaults to throwing error if the directory already exists.
   * @i18n 目录存在的情况下，默认抛出错误。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function mkdirSync(path: string, options?: MkdirOptions): void;

  /** Creates a new directory with the specified path.
   * @i18n 在指定路径下创建一个新的目录。
   *
   *       await Deno.mkdir("new_dir");
   *       await Deno.mkdir("nested/directories", { recursive: true });
   *       await Deno.mkdir("restricted_access_dir", { mode: 0o700 });
   *
   * Defaults to throwing error if the directory already exists.
   * @i18n 目录存在的情况下，默认抛出错误。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function mkdir(path: string, options?: MkdirOptions): Promise<void>;

  export interface MakeTempOptions {
    /** Directory where the temporary directory should be created (defaults to
     * the env variable TMPDIR, or the system's default, usually /tmp).
     * @i18n 指定在哪里创建临时文件夹（默认为环境变量 TMPDIR 或者是系统默认目录，ps：通常是 /tmp）。*/
    dir?: string;
    /** String that should precede the random portion of the temporary
     * directory's name.
     * @i18n 临时文件夹名前缀。*/
    prefix?: string;
    /** String that should follow the random portion of the temporary
     * directory's name.
     * @i18n 临时文件夹名后缀。*/
    suffix?: string;
  }

  /** Synchronously creates a new temporary directory in the default directory
   * for temporary files (see also `Deno.dir("temp")`), unless `dir` is specified.
   * Other optional options include prefixing and suffixing the directory name
   * with `prefix` and `suffix` respectively.
   * @i18n 以同步的方式在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件夹,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件夹名添加前缀的 `prefix` 和给文件夹名添加后缀的 `sufix`。
   *
   * The full path to the newly created directory is returned.
   * @i18n 返回新建文件夹的完整路径。
   *
   * Multiple programs calling this function simultaneously will create different
   * directories. It is the caller's responsibility to remove the directory when
   * no longer needed.
   * @i18n 多个程序同时调用该函数将会创建不同的文件夹。当不再需要该临时文件夹时，调用者应该主动删除该文件夹。
   *
   *       const tempDirName0 = Deno.makeTempDirSync();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = Deno.makeTempDirSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp339c944d
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  // TODO(ry) Doesn't check permissions.
  export function makeTempDirSync(options?: MakeTempOptions): string;

  /** Creates a new temporary directory in the default directory for temporary
   * files (see also `Deno.dir("temp")`), unless `dir` is specified.  Other
   * optional options include prefixing and suffixing the directory name with
   * `prefix` and `suffix` respectively.
   * @i18n 在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件夹,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件夹名添加前缀的 `prefix` 和给文件夹名添加后缀的 `sufix`。
   *
   * This call resolves to the full path to the newly created directory.
   * @i18n 返回新建文件夹的完整路径。
   *
   * Multiple programs calling this function simultaneously will create different
   * directories. It is the caller's responsibility to remove the directory when
   * no longer needed.
   * @i18n 多个程序同时调用该函数将会创建不同的文件夹。当不再需要该临时文件夹时，调用者应该主动删除该文件夹。
   *
   *       const tempDirName0 = await Deno.makeTempDir();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = await Deno.makeTempDir({ prefix: 'my_temp' }); // e.g. /tmp/my_temp339c944d
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  // TODO(ry) Doesn't check permissions.
  export function makeTempDir(options?: MakeTempOptions): Promise<string>;

  /** Synchronously creates a new temporary file in the default directory for
   * temporary files (see also `Deno.dir("temp")`), unless `dir` is specified.
   * Other optional options include prefixing and suffixing the directory name
   * with `prefix` and `suffix` respectively.
   * @i18n 以同步的方式在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件名添加前缀的 `prefix` 和给文件名添加后缀的 `sufix`。
   *
   * The full path to the newly created file is returned.
   * @i18n 返回新建文件的完整路径。
   *
   * Multiple programs calling this function simultaneously will create different
   * files. It is the caller's responsibility to remove the file when no longer
   * needed.
   * @i18n 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tempFileName0 = Deno.makeTempFileSync(); // e.g. /tmp/419e0bf2
   *       const tempFileName1 = Deno.makeTempFileSync({ prefix: 'my_temp' });  //e.g. /tmp/my_temp754d3098
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function makeTempFileSync(options?: MakeTempOptions): string;

  /** Creates a new temporary file in the default directory for temporary
   * files (see also `Deno.dir("temp")`), unless `dir` is specified.  Other
   * optional options include prefixing and suffixing the directory name with
   * `prefix` and `suffix` respectively.
   * @i18n 在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件名添加前缀的 `prefix` 和给文件名添加后缀的 `sufix`。
   *
   * This call resolves to the full path to the newly created file.
   * @i18n 返回新建文件的完整路径。
   *
   * Multiple programs calling this function simultaneously will create different
   * files. It is the caller's responsibility to remove the file when no longer
   * needed.
   * @i18n 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tmpFileName0 = await Deno.makeTempFile();  // e.g. /tmp/419e0bf2
   *       const tmpFileName1 = await Deno.makeTempFile({ prefix: 'my_temp' });  //e.g. /tmp/my_temp754d3098
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function makeTempFile(options?: MakeTempOptions): Promise<string>;

  /** Synchronously changes the permission of a specific file/directory of
   * specified path.  Ignores the process's umask.
   * @i18n 同步地更改指定路径下特定的文件/目录的权限。忽略进程的 umask。
   *
   *       Deno.chmodSync("/path/to/file", 0o666);
   *
   * For a full description, see [chmod](#chmod)
   * @i18n 相关完整说明，参考 [chmod](#chmod)
   *
   * NOTE: This API currently throws on Windows
   * @i18n 注意：该 API 当前在 Windows 上使用会抛出异常。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function chmodSync(path: string, mode: number): void;

  /** Changes the permission of a specific file/directory of specified path.
   * Ignores the process's umask.
   * @i18n 更改指定路径下特定的文件/目录的权限。忽略进程的 umask。
   *
   *       await Deno.chmod("/path/to/file", 0o666);
   *
   * The mode is a sequence of 3 octal numbers.  The first/left-most number
   * specifies the permissions for the owner.  The second number specifies the
   * permissions for the group. The last/right-most number specifies the
   * permissions for others.  For example, with a mode of 0o764, the owner (7) can
   * read/write/execute, the group (6) can read/write and everyone else (4) can
   * read only.
   * @i18n 该模式是3个八进制数字的序列。
   * 第一个/最左边的数字指定所有者（owner）的权限。
   * 第二个数字指定组（group）的权限。
   * 最后/最右边的数字指定其他用户的权限。
   * 例如，在 0o764 模式下，所有者（owner）有读/写/执行权限（7），组（group）有读/写权限（6），
   * 其他用户（4）只有读的权限。
   *
   * | 值     | 说明         |
   * | ------ | ----------- |
   * | 7      | read, write, and execute |
   * | 6      | read and write |
   * | 5      | read and execute |
   * | 4      | read only |
   * | 3      | write and execute |
   * | 2      | write only |
   * | 1      | execute only |
   * | 0      | no permission |
   *
   * NOTE: This API currently throws on Windows
   * @i18n 注意：该 API 当前在 Windows 上使用会抛出异常。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function chmod(path: string, mode: number): Promise<void>;

  /** Synchronously change owner of a regular file or directory. This functionality
   * is not available on Windows.
   * @i18n 同步地更改常规文件或目录的所有者。该功能在 Windows 上不可用。
   *
   *      Deno.chownSync("myFile.txt", 1000, 1002);
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。
   *
   * Throws Error (not implemented) if executed on Windows
   * @i18n 如果在 Windows 上执行，将抛出错误（未实现）。
   *
   * @param path path to the file
   * @param_i18n path 文件路径
   * @param uid 文件新的所有者的用户 ID (UID)
   * @param_i18n uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   * @param_i18n gid 文件新的所有者的用户组 ID (GID)
   */
  export function chownSync(path: string, uid: number, gid: number): void;

  /** Change owner of a regular file or directory. This functionality
   * is not available on Windows.
   * @i18n 更改常规文件或目录的所有者。该功能在 Windows 上不可用。
   *
   *      await Deno.chown("myFile.txt", 1000, 1002);
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。
   *
   * Throws Error (not implemented) if executed on Windows
   * @i18n 如果在 Windows 上执行，将抛出错误（未实现）。
   *
   * @param path path to the file
   * @param_i18n path 文件路径
   * @param uid 文件新的所有者的用户 ID (UID)
   * @param_i18n uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   * @param_i18n gid 文件新的所有者的用户组 ID (GID)
   */
  export function chown(path: string, uid: number, gid: number): Promise<void>;

  /** **UNSTABLE**: needs investigation into high precision time.
   * @i18n **不稳定**：需要对高精度时间（hrtime）进行调查。
   *
   * Synchronously changes the access (`atime`) and modification (`mtime`) times
   * of a file system object referenced by `path`. Given times are either in
   * seconds (UNIX epoch time) or as `Date` objects.
   * @i18n 同步地更改路径（`path`）引用的文件系统对象的访问时间（`atime`）和修改时间（`mtime`）。
   * 给定的时间参数可以是秒（UNIX 纪元时间）或者日期对象。
   *
   *       Deno.utimeSync("myfile.txt", 1556495550, new Date());
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function utimeSync(
    path: string,
    atime: number | Date,
    mtime: number | Date
  ): void;

  /** **UNSTABLE**: needs investigation into high precision time.
   * @i18n **UNSTABLE**: 需要调研高精度的 time。
   *
   * Changes the access (`atime`) and modification (`mtime`) times of a file
   * system object referenced by `path`. Given times are either in seconds
   * (UNIX epoch time) or as `Date` objects.
   * @i18n 基于文件系统的 `path` 改变访问 (`atime`) 和修改 (`mtime`) 的时间。
   * 给定的时间以秒 （UNIX epoch time） 为单位或着是 `Date` 对象。
   *
   *       await Deno.utime("myfile.txt", 1556495550, new Date());
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function utime(
    path: string,
    atime: number | Date,
    mtime: number | Date
  ): Promise<void>;

  export interface RemoveOptions {
    /** Defaults to `false`. If set to `true`, path will be removed even if
     * it's a non-empty directory.
     * @i18n 默认为 `false`。如果设置为 `true`，则即使路径为非空目录也会被删除。*/
    recursive?: boolean;
  }

  /** Synchronously removes the named file or directory.
   * @i18n 同步删除指定的文件或目录。
   *
   *       Deno.removeSync("/path/to/empty_dir/or/file");
   *       Deno.removeSync("/path/to/populated_dir/or/file", { recursive: true });
   *
   * Throws error if permission denied, path not found, or path is a non-empty
   * directory and the `recursive` option isn't set to `true`.
   * @i18n 当权限被拒绝、路径找不到或者为非空目录且 `recursive` 未设置为 `true`，则抛出异常。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function removeSync(path: string, options?: RemoveOptions): void;

  /** Removes the named file or directory.
   * @i18n 删除指定的文件或目录。
   *
   *       await Deno.remove("/path/to/empty_dir/or/file");
   *       await Deno.remove("/path/to/populated_dir/or/file", { recursive: true });
   *
   * Throws error if permission denied, path not found, or path is a non-empty
   * directory and the `recursive` option isn't set to `true`.
   * @i18n 当权限被拒绝、路径找不到或者为非空目录且 `recursive` 未设置为 `true`，则抛出异常。
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function remove(path: string, options?: RemoveOptions): Promise<void>;

  /** Synchronously renames (moves) `oldpath` to `newpath`. Paths may be files or
   * directories.  If `newpath` already exists and is not a directory,
   * `renameSync()` replaces it. OS-specific restrictions may apply when
   * `oldpath` and `newpath` are in different directories.
   * @i18n 同步方式将 `oldpath` 重命名（或移动）为 `newpath`。路径可以是文件或目录。
   * 如果 `newpath` 已经存在且不是目录，那么 `rename()` 将替换它。
   * 当 `oldpath` 和 `newpath` 位于不同的目录中时，可能会受到操作系统的限制。
   *
   *       Deno.renameSync("old/path", "new/path");
   *
   * On Unix, this operation does not follow symlinks at either path.
   * @i18n 在 Unix 系统上，此操作不会修改符号链接所指向的内容。
   *
   * It varies between platforms when the operation throws errors, and if so what
   * they are. It's always an error to rename anything to a non-empty directory.
   * @i18n 当操作引发错误时，平台之间会有所不同。
   * 如果 `newpath` 是非空目录则始终会报错。
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function renameSync(oldpath: string, newpath: string): void;

  /** Renames (moves) `oldpath` to `newpath`.  Paths may be files or directories.
   * If `newpath` already exists and is not a directory, `rename()` replaces it.
   * OS-specific restrictions may apply when `oldpath` and `newpath` are in
   * different directories.
   * @i18n 将 `oldpath` 重命名（或移动）为 `newpath`。路径可以是文件或目录。
   * 如果 `newpath` 已经存在且不是目录，那么 `rename()` 将替换它。
   * 当 `oldpath` 和 `newpath` 位于不同的目录中时，可能会受到操作系统的限制。
   *
   *       await Deno.rename("old/path", "new/path");
   *
   * On Unix, this operation does not follow symlinks at either path.
   * @i18n 在 Unix 系统上，此操作不会修改符号链接所指向的内容。
   *
   * It varies between platforms when the operation throws errors, and if so what
   * they are. It's always an error to rename anything to a non-empty directory.
   * @i18n 当操作引发错误时，平台之间会有所不同。
   * 如果 `newpath` 是非空目录则始终会报错。
   *
   * Requires `allow-read` and `allow-write` permission.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function rename(oldpath: string, newpath: string): Promise<void>;

  /** Synchronously reads and returns the entire contents of a file as an array
   * of bytes. `TextDecoder` can be used to transform the bytes to string if
   * required.  Reading a directory returns an empty data array.
   * @i18n 同步地读取并将文件的全部内容解析为字节数组。
   * `TextDecoder` 可以在需要的情况下可以将字节转换成字符串。
   * 读取目录返回一个空的数据数组。
   *
   *       const decoder = new TextDecoder("utf-8");
   *       const data = Deno.readFileSync("hello.txt");
   *       console.log(decoder.decode(data));
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function readFileSync(path: string): Uint8Array;

  /** Reads and resolves to the entire contents of a file as an array of bytes.
   * `TextDecoder` can be used to transform the bytes to string if required.
   * Reading a directory returns an empty data array.
   * @i18n 读取并将文件的全部内容解析为字节数组。
   * `TextDecoder` 可以在需要的情况下可以将字节转换成字符串。
   * 读取目录返回一个空的数据数组。
   *
   *       const decoder = new TextDecoder("utf-8");
   *       const data = await Deno.readFile("hello.txt");
   *       console.log(decoder.decode(data));
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function readFile(path: string): Promise<Uint8Array>;

  /** A FileInfo describes a file and is returned by `stat`, `lstat`,
   * `statSync`, `lstatSync`.
   * @i18n FileInfo 用于描述 `stat`, `lstat`,
   * `statSync`, `lstatSync` 函数返回的文件信息。而 `readdir`,
   * `readdirSync` 返回的信息则用 FileInfo 列表来描述。*/
  export interface FileInfo {
    /** True if this is info for a regular file. Mutually exclusive to
     * `FileInfo.isDirectory` and `FileInfo.isSymlink`.
     * @i18n 判断文件是否为一个常规文件。该结果与 `FileInfo.isDirectory` 和 `FileInfo.isSymlink` 互斥。*/
    isFile: boolean;
    /** True if this is info for a regular directory. Mutually exclusive to
     * `FileInfo.isFile` and `FileInfo.isSymlink`.
     * @i18n 判断文件是否为一个常规目录。该结果与 `FileInfo.isFile` 和 `FileInfo.isSymlink` 互斥。*/
    isDirectory: boolean;
    /** True if this is info for a symlink. Mutually exclusive to
     * `FileInfo.isFile` and `FileInfo.isDirectory`.
     * @i18n 判断文件是否为一个符号链接。该结果与 `FileInfo.isDirectory` 和 `FileInfo.isDirectory` 互斥。*/
    isSymlink: boolean;
    /** The size of the file, in bytes.
     * @i18n 文件的大小，单位 byte。*/
    size: number;
    /** The last modification time of the file. This corresponds to the `mtime`
     * field from `stat` on Linux/Mac OS and `ftLastWriteTime` on Windows. This
     * may not be available on all platforms.
     * @i18n 文件最后修改时间。
     * 在 Linux/Mac 系统这个值是 `mtime`，在 Windows 系统这个值是 `ftLastWriteTime`。
     * 在某些系统中这个属性可能不存在。*/
    modified: number | null;
    /** The last access time of the file. This corresponds to the `atime`
     * field from `stat` on Unix and `ftLastAccessTime` on Windows. This may not
     * be available on all platforms.
     * @i18n 文件最后访问时间。
     * 在 Linux/Mac 系统这个值是 `atime`，在 Windows 系统这个值是 `ftLastAccessTime`。
     * 在某些系统中这个属性可能不存在。*/
    accessed: number | null;
    /** The last access time of the file. This corresponds to the `birthtime`
     * field from `stat` on Mac/BSD and `ftCreationTime` on Windows. This may not
     * be available on all platforms.
     * @i18n 文件的创建时间。
     * 在 Linux/Mac 系统这个值是 `birthtime`，在 Windows 系统这个值是 `ftCreationTime`。
     * 在某些系统中这个属性可能不存在。*/
    created: number | null;
    /** ID of the device containing the file.
     * @i18n 包含此文件的设备的 ID。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    dev: number | null;
    /** Inode number.
     * @i18n Inode 值。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    ino: number | null;
    /** **UNSTABLE**: Match behavior with Go on Windows for `mode`.
     * @i18n **不稳定**: 将此属性的行为与 Windows 上的 Go 相匹配。
     *
     * The underlying raw `st_mode` bits that contain the standard Unix
     * permissions for this file/directory.
     * @i18n 该文件或目录的权限位，返回标准的 Unix 底层 `st_mode` 位。*/
    mode: number | null;
    /** Number of hard links pointing to this file.
     * @i18n 文件的硬链接数。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    nlink: number | null;
    /** User ID of the owner of this file.
     * @i18n 拥有该文件的用户的 uid。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    uid: number | null;
    /** User ID of the owner of this file.
     * @i18n 拥有该文件的用户组的 gid。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    gid: number | null;
    /** Device ID of this file.
     * @i18n 文件设备标识符 ID。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    rdev: number | null;
    /** Blocksize for filesystem I/O.
     * @i18n 用于 I/O 操作的文件系统块的大小。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    blksize: number | null;
    /** Number of blocks allocated to the file, in 512-byte units.
     * @i18n 为此文件分配的块数，此值是一个 512 字节单位。
     *
     * _Linux/Mac OS only._
     * @i18n _只在 Linux/Mac OS 有效。_*/
    blocks: number | null;
  }

  /** Returns absolute normalized path, with symbolic links resolved.
   * @i18n 返回被解析后的符号链接绝对路径。
   *
   *       // e.g. given /home/alice/file.txt and current directory /home/alice
   *       Deno.symlinkSync("file.txt", "symlink_file.txt");
   *       const realPath = Deno.realpathSync("./file.txt");
   *       const realSymLinkPath = Deno.realpathSync("./symlink_file.txt");
   *       console.log(realPath);  // outputs "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  //outputs "/home/alice/file.txt"
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function realpathSync(path: string): string;

  /** Resolves to the absolute normalized path, with symbolic links resolved.
   * @i18n 返回被解析后的符号链接绝对路径。
   *
   *       // e.g. given /home/alice/file.txt and current directory /home/alice
   *       await Deno.symlink("file.txt", "symlink_file.txt");
   *       const realPath = await Deno.realpath("./file.txt");
   *       const realSymLinkPath = await Deno.realpath("./symlink_file.txt");
   *       console.log(realPath);  // outputs "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  //outputs "/home/alice/file.txt"
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限*/
  export function realpath(path: string): Promise<string>;

  export interface DirEntry extends FileInfo {
    name: string;
  }

  /** Synchronously reads the directory given by `path` and returns an iterable
   * of `Deno.DirEntry`.
   * @i18n 同步读取 `path` 文件目录，并返回 `Deno.DirEntry` 迭代器。
   *
   *       for (const dirEntry of Deno.readdirSync("/")) {
   *         console.log(dirEntry.name);
   *       }
   *
   * Throws error if `path` is not a directory.
   * @i18n 如果 `path` 不是目录则抛出错误。
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function readdirSync(path: string): Iterable<DirEntry>;

  /** Reads the directory given by `path` and returns an async iterable of
   * `Deno.DirEntry`.
   * @i18n 读取 `path` 文件目录，并返回 `Deno.DirEntry` 迭代器。
   *
   *       for await (const dirEntry of Deno.readdir("/")) {
   *         console.log(dirEntry.name);
   *       }
   *
   * Throws error if `path` is not a directory.
   * @i18n 如果 `path` 不是目录则抛出错误。
   *
   * Requires `allow-read` permission. */
  export function readdir(path: string): AsyncIterable<DirEntry>;

  /** Synchronously copies the contents and permissions of one file to another
   * specified path, by default creating a new file if needed, else overwriting.
   * Fails if target path is a directory or is unwritable.
   * @i18n 采用同步方式将一个文件的内容和权限复制到另一个指定的路径，默认情况下根据需要
   * 创建新文件或者覆盖原文件。 如果目标路径是目录或不可写，则失败。
   *
   *       Deno.copyFileSync("from.txt", "to.txt");
   *
   * Requires `allow-read` permission on fromPath.
   * Requires `allow-write` permission on toPath.
   * @i18n `fromPath` 需要 `allow-read` 权限。
   * `toPath` 需要 `allow-write` 权限。*/
  export function copyFileSync(fromPath: string, toPath: string): void;

  /** Copies the contents and permissions of one file to another specified path,
   * by default creating a new file if needed, else overwriting. Fails if target
   * path is a directory or is unwritable.
   * @i18n 将一个文件的内容和权限复制到另一个指定的路径，默认情况下根据需要
   * 创建新文件或者覆盖原文件。 如果目标路径是目录或不可写，则失败。
   *
   *       await Deno.copyFile("from.txt", "to.txt");
   *
   * Requires `allow-read` permission on fromPath.
   * Requires `allow-write` permission on toPath.
   * @i18n `fromPath` 需要 `allow-read` 权限。
   * `toPath` 需要 `allow-write` 权限。*/
  export function copyFile(fromPath: string, toPath: string): Promise<void>;

  /** Returns the full path destination of the named symbolic link.
   * @i18n 同步方式解析并返回符号链接对目标文件的绝对路径。
   *
   *       Deno.symlinkSync("./test.txt", "./test_link.txt");
   *       const target = Deno.readlinkSync("./test_link.txt"); // ./test.txt 的绝对路径
   *
   * Throws TypeError if called with a hard link
   * @i18n 如果使用硬链接调用，则会抛出 `TypeError`。
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function readlinkSync(path: string): string;

  /** Resolves to the full path destination of the named symbolic link.
   * @i18n 解析并返回符号链接对目标文件的绝对路径。
   *
   *       await Deno.symlink("./test.txt", "./test_link.txt");
   *       const target = await Deno.readlink("./test_link.txt"); // ./test.txt 的绝对路径
   *
   * Throws TypeError if called with a hard link
   * @i18n 如果使用硬链接调用，则会抛出 `TypeError`。
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function readlink(path: string): Promise<string>;

  /** Resolves to a `Deno.FileInfo` for the specified `path`. If `path` is a
   * symlink, information for the symlink will be returned instead of what it
   * points to.
   * @i18n 解析给定的 `path`，并返回 `Deno.FileInfo`。如果 `path` 是一个
   * 符号链接，则将返回符号链接的信息，而不是该符号链接引用的文件信息。
   *
   *       const fileInfo = await Deno.lstat("hello.txt");
   *       assert(fileInfo.isFile);
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function lstat(path: string): Promise<FileInfo>;

  /** Synchronously returns a `Deno.FileInfo` for the specified `path`. If
   * `path` is a symlink, information for the symlink will be returned instead of
   * what it points to..
   * @i18n 同步方式解析给定的 `path`，并返回 `Deno.FileInfo`。如果 `path` 是一个
   * 符号链接，则将返回符号链接的信息，而不是该符号链接引用的文件信息。
   *
   *       const fileInfo = Deno.lstatSync("hello.txt");
   *       assert(fileInfo.isFile);
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function lstatSync(path: string): FileInfo;

  /** Resolves to a `Deno.FileInfo` for the specified `path`. Will always
   * follow symlinks.
   * @i18n 解析给定 `path`，返回 `Deno.FileInfo`。如果 `path` 为符号链接，则返回符号链接指向的文件。
   *
   *       const fileInfo = await Deno.stat("hello.txt");
   *       assert(fileInfo.isFile);
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function stat(path: string): Promise<FileInfo>;

  /** Synchronously returns a `Deno.FileInfo` for the specified `path`. Will
   * always follow symlinks.
   * @i18n 同步方式解析给定 `path`，返回 `Deno.FileInfo`。
   * 如果 `path` 为符号链接，则返回符号链接指向的文件。
   *
   *       const fileInfo = Deno.statSync("hello.txt");
   *       assert(fileInfo.isFile);
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function statSync(path: string): FileInfo;

  /** Synchronously creates `newpath` as a hard link to `oldpath`.
   * @i18n 同步方式创建 `newpath` 作为 `oldpath` 的硬链接。
   *
   *       Deno.linkSync("old/name", "new/name");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function linkSync(oldpath: string, newpath: string): void;

  /** Creates `newpath` as a hard link to `oldpath`.
   * @i18n 创建 `newpath` 作为 `oldpath` 的硬链接。
   *
   *       await Deno.link("old/name", "new/name");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function link(oldpath: string, newpath: string): Promise<void>;

  /** **UNSTABLE**: `type` argument type may be changed to `"dir" | "file"`.
   * @i18n **不稳定**：`type` 参数可能更改为 `"dir" | "file"` 的联合类型。
   *
   * Creates `newpath` as a symbolic link to `oldpath`.
   * @i18n 同步方式创建 `newpath` 作为指向 `oldpath` 的符号链接。
   *
   * The type argument can be set to `dir` or `file`. This argument is only
   * available on Windows and ignored on other platforms.
   * @i18n `type` 参数可以设置为 `dir` 或 `file`。此参数仅在 Windows 上可用，其他平台会被忽略。
   *
   * NOTE: This function is not yet implemented on Windows.
   * @i18n 注意：此函数尚未在 Windows 上实现。
   *
   *       Deno.symlinkSync("old/name", "new/name");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function symlinkSync(
    oldpath: string,
    newpath: string,
    type?: string
  ): void;

  /** **UNSTABLE**: `type` argument may be changed to `"dir" | "file"`
   * @i18n **不稳定**：`type` 参数可能更改为 `"dir" | "file"` 的联合类型。
   *
   * Creates `newpath` as a symbolic link to `oldpath`.
   * @i18n 创建 `newpath` 作为指向 `oldpath` 的符号链接。
   *
   * The type argument can be set to `dir` or `file`. This argument is only
   * available on Windows and ignored on other platforms.
   * @i18n `type` 参数可以设置为 `dir` 或 `file`。此参数仅在 Windows 上可用，其他平台会被忽略。
   *
   * NOTE: This function is not yet implemented on Windows.
   * @i18n 注意：此函数尚未在 Windows 上实现。
   *
   *       await Deno.symlink("old/name", "new/name");
   *
   * Requires `allow-read` and `allow-write` permissions.
   * @i18n 需要 `allow-read` 和 `allow-write` 权限。*/
  export function symlink(
    oldpath: string,
    newpath: string,
    type?: string
  ): Promise<void>;

  /** Options for writing to a file.
   * @i18n `Deno.writeFileSync` 和 `Deno.writeFile` 的选项。*/
  export interface WriteFileOptions {
    /** Defaults to `false`. If set to `true`, will append to a file instead of
     * overwriting previous contents.
     * @i18n 默认为 `false`。如果设置为 `true`，则将追加到文件中，而不是覆盖之前的内容。*/
    append?: boolean;
    /** Sets the option to allow creating a new file, if one doesn't already
     * exist at the specified path (defaults to `true`).
     * @i18n 默认为 `true`。如果指定路径不存在文件，是否允许创建新文件的选项。*/
    create?: boolean;
    /** Permissions always applied to file.
     * @i18n 文件的权限。*/
    mode?: number;
  }

  /** Synchronously write `data` to the given `path`, by default creating a new
   * file if needed, else overwriting.
   * @i18n 同步方式将 `data` 写入给定的 `path`，并且根据需要创建新文件或者覆盖原文件。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world\n");
   *       Deno.writeFileSync("hello1.txt", data);  // 覆盖或者创建 "hello1.txt"
   *       Deno.writeFileSync("hello2.txt", data, {create: false});  // 仅当 "hello2.txt" 存在的情况下才有效
   *       Deno.writeFileSync("hello3.txt", data, {mode: 0o777});  // 设置新文件的权限
   *       Deno.writeFileSync("hello4.txt", data, {append: true});  // 在文件末尾添加数据
   *
   * Requires `allow-write` permission, and `allow-read` if `options.create` is
   * `false`.
   * @i18n 需要 `allow-write` 权限。如果 `options.create` 为 `false` 且需要 `allow-read` 权限。
   */
  export function writeFileSync(
    path: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ): void;

  /** Write `data` to the given `path`, by default creating a new file if needed,
   * else overwriting.
   * @i18n 将 `data` 写入给定的 `path`，并且根据需要创建新文件或者覆盖原文件。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world\n");
   *       await Deno.writeFile("hello1.txt", data);  // 覆盖或者创建 "hello1.txt"
   *       await Deno.writeFile("hello2.txt", data, {create: false});  // 仅当 "hello2.txt" 存在的情况下才有效
   *       await Deno.writeFile("hello3.txt", data, {mode: 0o777});  // 设置新文件的权限
   *       await Deno.writeFile("hello4.txt", data, {append: true});  // 在文件末尾添加数据
   *
   * Requires `allow-write` permission, and `allow-read` if `options.create` is `false`.
   * @i18n 需要 `allow-write` 权限。如果 `options.create` 为 `false` 且需要 `allow-read` 权限。
   */
  export function writeFile(
    path: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>;

  /** **UNSTABLE**: Should not have same name as `window.location` type.
   * @i18n **不稳定**: 不应该和 `window.location` 具有相同的类型名。*/
  interface Location {
    /** The full url for the module, e.g. `file://some/file.ts` or
     * `https://some/file.ts`.
     * @i18n 模块的完整 url，例如：`file://some/file.ts` 抑或是 `https://some/file.ts`。*/
    fileName: string;
    /** The line number in the file. It is assumed to be 1-indexed.
     * @i18n 在文件中的行号，从 1 开始索引。*/
    lineNumber: number;
    /** The column number in the file. It is assumed to be 1-indexed.
     * @i18n 在文件中的列号，从 1 开始索引。*/
    columnNumber: number;
  }

  /** UNSTABLE: new API, yet to be vetted.
   * @i18n 不稳定: 新 API，尚待审查。
   *
   * Given a current location in a module, lookup the source location and return
   * it.
   * @i18n 给定模块中的当前位置，返回查找到的源文件中位置。
   *
   * When Deno transpiles code, it keep source maps of the transpiled code. This
   * function can be used to lookup the original location. This is
   * automatically done when accessing the `.stack` of an error, or when an
   * uncaught error is logged. This function can be used to perform the lookup
   * for creating better error handling.
   * @i18n 当 Deno 编译代码时，它将保留已编译代码的 source maps。
   * 此功能可用于查找原始位置。
   * 当访问 error 的 `.stack` 属性或出现未捕获的错误时，会自动执行此操作。
   * 此功能可用于查找源文件以创建更好的错误处理。
   *
   * **Note:** `line` and `column` are 1 indexed, which matches display
   * expectations, but is not typical of most index numbers in Deno.
   * @i18n **注意:** `line` 和 `column` 的下标从 1 开始，与代码的显示值匹配，但这种以 1 开始的索引方式并不代表 Deno 中大多数文件都是如此。
   *
   * An example:
   * @i18n 示例:
   *
   *       const orig = Deno.applySourceMap({
   *         fileName: "file://my/module.ts",
   *         lineNumber: 5,
   *         columnNumber: 15
   *       });
   *       console.log(`${orig.filename}:${orig.line}:${orig.column}`);
   */
  export function applySourceMap(location: Location): Location;

  /** A set of error constructors that are raised by Deno APIs.
   * @i18n 一些 Error 构造函数的集合，当 Deno API 抛出错误时会用到这些异常。*/
  export const errors: {
    NotFound: ErrorConstructor;
    PermissionDenied: ErrorConstructor;
    ConnectionRefused: ErrorConstructor;
    ConnectionReset: ErrorConstructor;
    ConnectionAborted: ErrorConstructor;
    NotConnected: ErrorConstructor;
    AddrInUse: ErrorConstructor;
    AddrNotAvailable: ErrorConstructor;
    BrokenPipe: ErrorConstructor;
    AlreadyExists: ErrorConstructor;
    InvalidData: ErrorConstructor;
    TimedOut: ErrorConstructor;
    Interrupted: ErrorConstructor;
    WriteZero: ErrorConstructor;
    UnexpectedEof: ErrorConstructor;
    BadResource: ErrorConstructor;
    Http: ErrorConstructor;
    Busy: ErrorConstructor;
  };

  /** **UNSTABLE**: potentially want names to overlap more with browser.
   * @i18n **不稳定**：希望与浏览器在名称上有更多的相同。
   *
   * The permissions as granted by the caller.
   * @i18n 调用方授予的权限。
   *
   * See: https://w3c.github.io/permissions/#permission-registry
   * @i18n 具体查看：https://w3c.github.io/permissions/#permission-registry */
  export type PermissionName =
    | "run"
    | "read"
    | "write"
    | "net"
    | "env"
    | "plugin"
    | "hrtime";

  /** The current status of the permission.
   * @i18n 权限的状态。
   *
   * See: https://w3c.github.io/permissions/#status-of-a-permission
   * @i18n 具体查看：https://w3c.github.io/permissions/#status-of-a-permission */
  export type PermissionState = "granted" | "denied" | "prompt";

  interface RunPermissionDescriptor {
    name: "run";
  }

  interface ReadWritePermissionDescriptor {
    name: "read" | "write";
    path?: string;
  }

  interface NetPermissionDescriptor {
    name: "net";
    url?: string;
  }

  interface EnvPermissionDescriptor {
    name: "env";
  }

  interface PluginPermissionDescriptor {
    name: "plugin";
  }

  interface HrtimePermissionDescriptor {
    name: "hrtime";
  }

  /** Permission descriptors which define a permission which can be queried,
   * requested, or revoked.
   * @i18n 权限描述符，定义一个可以查询、请求或撤销的权限。
   *
   * See: https://w3c.github.io/permissions/#permission-descriptor
   * @i18n 具体查看：https://w3c.github.io/permissions/#permission-descriptor */
  type PermissionDescriptor =
    | RunPermissionDescriptor
    | ReadWritePermissionDescriptor
    | NetPermissionDescriptor
    | EnvPermissionDescriptor
    | PluginPermissionDescriptor
    | HrtimePermissionDescriptor;

  export class Permissions {
    /** Resolves to the current status of a permission.
     * @i18n 查询给定权限的状态。
     *
     *       const status = await Deno.permissions.query({ name: "read", path: "/etc" });
     *       if (status.state === "granted") {
     *         data = await Deno.readFile("/etc/passwd");
     *       }
     */
    query(desc: PermissionDescriptor): Promise<PermissionStatus>;

    /** Revokes a permission, and resolves to the state of the permission.
     * @i18n 撤销给定的权限，并且返回该权限的状态。
     *
     *       const status = await Deno.permissions.revoke({ name: "run" });
     *       assert(status.state !== "granted")
     */
    revoke(desc: PermissionDescriptor): Promise<PermissionStatus>;

    /** Requests the permission, and resolves to the state of the permission.
     * @i18n 请求权限，并且返回该权限请求结果的状态。
     *
     *       const status = await Deno.permissions.request({ name: "env" });
     *       if (status.state === "granted") {
     *         console.log(Deno.homeDir());
     *       } else {
     *         console.log("'env' permission is denied.");
     *       }
     */
    request(desc: PermissionDescriptor): Promise<PermissionStatus>;
  }

  /** **UNSTABLE**: maybe move to `navigator.permissions` to match web API.
   * @i18n **不稳定**：可能移动到 `navigator.permissions` 以匹配 web API。*/
  export const permissions: Permissions;

  /** see: https://w3c.github.io/permissions/#permissionstatus
   * @i18n 具体查看：https://w3c.github.io/permissions/#permissionstatus */
  export class PermissionStatus {
    state: PermissionState;
    constructor(state: PermissionState);
  }

  /** Synchronously truncates or extends the specified file, to reach the
   * specified `len`.  If `len` is not specified then the entire file contents
   * are truncated.
   * @i18n 同步地通过指定的 `len` ，截取或者扩展指定的文件内容。如果未指定 `len` ，则整个文件内容将被截取。
   *
   *       //truncate the entire file
   *       Deno.truncateSync("my_file.txt");
   *
   *       //truncate part of the file
   *       const file = Deno.makeTempFileSync();
   *       Deno.writeFileSync(file, new TextEncoder().encode("Hello World"));
   *       Deno.truncateSync(file, 7);
   *       const data = Deno.readFileSync(file);
   *       console.log(new TextDecoder().decode(data));
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function truncateSync(name: string, len?: number): void;

  /** Truncates or extends the specified file, to reach the specified `len`. If
   * `len` is not specified then the entire file contents are truncated.
   * @i18n 通过指定的 `len` ，截取或者扩展指定的文件内容。如果未指定 `len` ，则整个文件内容将被截取。
   *
   *       //truncate the entire file
   *       await Deno.truncate("my_file.txt");
   *
   *       //truncate part of the file
   *       const file = await Deno.makeTempFile();
   *       await Deno.writeFile(file, new TextEncoder().encode("Hello World"));
   *       await Deno.truncate(file, 7);
   *       const data = await Deno.readFile(file);
   *       console.log(new TextDecoder().decode(data));  //"Hello W"
   *
   * Requires `allow-write` permission.
   * @i18n 需要 `allow-write` 权限。*/
  export function truncate(name: string, len?: number): Promise<void>;

  export interface AsyncHandler {
    (msg: Uint8Array): void;
  }

  export interface PluginOp {
    dispatch(
      control: Uint8Array,
      zeroCopy?: ArrayBufferView | null
    ): Uint8Array | null;
    setAsyncHandler(handler: AsyncHandler): void;
  }

  export interface Plugin {
    ops: {
      [name: string]: PluginOp;
    };
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Open and initalize a plugin.
   * @i18n 打开并初始化插件。
   *
   *        const plugin = Deno.openPlugin("./path/to/some/plugin.so");
   *        const some_op = plugin.ops.some_op;
   *        const response = some_op.dispatch(new Uint8Array([1,2,3,4]));
   *        console.log(`Response from plugin ${response}`);
   *
   * Requires `allow-plugin` permission.
   * @i18n 需要 `allow-plugin` 权限。*/
  export function openPlugin(filename: string): Plugin;
  export interface NetAddr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  export interface UnixAddr {
    transport: "unix" | "unixpacket";
    address: string;
  }

  export type Addr = NetAddr | UnixAddr;
  /** **UNSTABLE**: Maybe remove `ShutdownMode` entirely.
   * @i18n **不稳定**：可能会完全删除 `ShutdownMode`。
   *
   * Corresponds to `SHUT_RD`, `SHUT_WR`, `SHUT_RDWR` on POSIX-like systems.
   * @i18n 对应类 POSIX 系统上的 `SHUT_RD`，`SHUT_WR`，`SHUT_RDWR`。
   *
   * See: http://man7.org/linux/man-pages/man2/shutdown.2.html
   * @i18n 参阅：http://man7.org/linux/man-pages/man2/shutdown.2.html */
  export enum ShutdownMode {
    Read = 0,
    Write,
    ReadWrite, // TODO(ry) panics on ReadWrite.
  }

  /** **UNSTABLE**: Both the `how` parameter and `ShutdownMode` enum are under
   * consideration for removal.
   * @i18n **不稳定**：参数 `how` 和枚举 `ShutdownMode` 都在考虑移除。
   *
   * Shutdown socket send and receive operations.
   * @i18n Shutdown 套接字的发送和接收操作。
   *
   * Matches behavior of POSIX shutdown(3).
   * @i18n 与 POSIX 的 shutdown(3) 行为一致。
   *
   *       const listener = Deno.listen({ port: 80 });
   *       const conn = await listener.accept();
   *       Deno.shutdown(conn.rid, Deno.ShutdownMode.Write);
   */
  export function shutdown(rid: number, how: ShutdownMode): void;

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**：新的 API，尚待审查。
   *
   * A generic transport listener for message-oriented protocols.
   * @i18n 面向消息协议的通用传输监听器。*/
  export interface DatagramConn extends AsyncIterable<[Uint8Array, Addr]> {
    /** **UNSTABLE**: new API, yet to be vetted.
     * @i18n **不稳定**：新的 API，尚待审查。
     *
     * Waits for and resolves to the next message to the `UDPConn`.
     * @i18n 等待并解析 (resolve) 为下一条消息传递给 `UDPConn`。*/
    receive(p?: Uint8Array): Promise<[Uint8Array, Addr]>;
    /** UNSTABLE: new API, yet to be vetted.
     * @i18n **不稳定**：新的 API，尚待审查。
     *
     * Sends a message to the target.
     * @i18n 向目标发送消息。*/
    send(p: Uint8Array, addr: Addr): Promise<void>;
    /** UNSTABLE: new API, yet to be vetted.
     * @i18n **不稳定**：新的 API，尚待审查。
     *
     * Close closes the socket. Any pending message promises will be rejected
     * with errors.
     * @i18n 关闭套接字。任何待处理的消息应答都将被拒绝 (rejected)，并返回错误。*/
    close(): void;
    /** Return the address of the `UDPConn`. */
    readonly addr: Addr;
    [Symbol.asyncIterator](): AsyncIterableIterator<[Uint8Array, Addr]>;
  }

  /** A generic network listener for stream-oriented protocols.
   * @i18n 面向流协议的通用网络监听器。*/
  export interface Listener extends AsyncIterable<Conn> {
    /** Waits for and resolves to the next connection to the `Listener`.
     * @i18n 等待并解析 (resolve) 到与 `Listener` 的下一个连接。*/
    accept(): Promise<Conn>;
    /** Close closes the listener. Any pending accept promises will be rejected
     * with errors.
     * @i18n 关闭监听器。任何待处理的接收应答都将被拒绝 (rejected)，并返回错误。*/
    close(): void;
    /** Return the address of the `Listener`.
     * @i18n 返回 `Listener` 的地址。*/
    readonly addr: Addr;

    [Symbol.asyncIterator](): AsyncIterableIterator<Conn>;
  }

  export interface Conn extends Reader, Writer, Closer {
    /** The local address of the connection.
     * @i18n 连接的本地地址。*/
    readonly localAddr: Addr;
    /** The remote address of the connection.
     * @i18n 连接的远程地址。*/
    readonly remoteAddr: Addr;
    /** The resource ID of the connection.
     * @i18n 连接的资源 ID。*/
    readonly rid: number;
    /** Shuts down (`shutdown(2)`) the reading side of the TCP connection. Most
     * callers should just use `close()`.
     * @i18n 关闭 (`shutdown(2)`) TCP 连接的读取端。大多数调用者应该只使用 `close()`。*/
    closeRead(): void;
    /** Shuts down (`shutdown(2)`) the writing side of the TCP connection. Most
     * callers should just use `close()`.
     * @i18n 关闭 (`shutdown(2)`) TCP 连接的写入端。大多数调用者应该只使用 `close()`。*/
    closeWrite(): void;
  }

  export interface ListenOptions {
    /** The port to listen on.
     * @i18n 要监听的端口号。*/
    port: number;
    /** A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `0.0.0.0`.
     * @i18n 一个 IP 地址或者可以被解析为 IP 地址的主机名。
     * 如果没有指定，默认值为 `0.0.0.0`。*/
    hostname?: string;
  }

  export interface UnixListenOptions {
    /** A Path to the Unix Socket.
     * @i18n 一个 Unix 套接字路径。*/
    address: string;
  }
  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Listen announces on the local transport address.
   * @i18n 在本地监听网络连接。
   *
   *      const listener1 = Deno.listen({ port: 80 })
   *      const listener2 = Deno.listen({ hostname: "192.0.2.1", port: 80 })
   *      const listener3 = Deno.listen({ hostname: "[2001:db8::1]", port: 80 });
   *      const listener4 = Deno.listen({ hostname: "golang.org", port: 80, transport: "tcp" });
   *
   * Requires `allow-net` permission.
   * @i18n 需要 `allow-net` 权限。*/
  export function listen(
    options: ListenOptions & { transport?: "tcp" }
  ): Listener;
  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Listen announces on the local transport address.
   * @i18n 在本地监听网络连接。
   *
   *     const listener = Deno.listen({ address: "/foo/bar.sock", transport: "unix" })
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function listen(
    options: UnixListenOptions & { transport: "unix" }
  ): Listener;
  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Listen announces on the local transport address.
   * @i18n 在本地监听网络连接。
   *
   *      const listener1 = Deno.listen({ port: 80, transport: "udp" })
   *      const listener2 = Deno.listen({ hostname: "golang.org", port: 80, transport: "udp" });
   *
   * Requires `allow-net` permission.
   * @i18n 需要 `allow-net` 权限。*/
  export function listen(
    options: ListenOptions & { transport: "udp" }
  ): DatagramConn;
  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Listen announces on the local transport address.
   * @i18n 在本地监听网络连接。
   *
   *     const listener = Deno.listen({ address: "/foo/bar.sock", transport: "unixpacket" })
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。*/
  export function listen(
    options: UnixListenOptions & { transport: "unixpacket" }
  ): DatagramConn;

  export interface ListenTLSOptions extends ListenOptions {
    /** Server certificate file.
     * @i18n 服务器证书文件。*/
    certFile: string;
    /** Server public key file.
     * @i18n 服务器公钥文件。*/
    keyFile: string;

    transport?: "tcp";
  }

  /** Listen announces on the local transport address over TLS (transport layer
   * security).
   * @i18n 在本地监听来自 TLS （传输层安全性协议）的网络连接。
   *
   *      const lstnr = Deno.listenTLS({ port: 443, certFile: "./server.crt", keyFile: "./server.key" });
   *
   * Requires `allow-net` permission.
   * @i18n 需要 `allow-net` 权限。*/
  export function listenTLS(options: ListenTLSOptions): Listener;

  export interface ConnectOptions {
    /** The port to connect to.
     * @i18n 要连接的端口号。*/
    port: number;
    /** A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `127.0.0.1`.
     * @i18n 一个 IP 地址或者可以被解析为 IP 地址的主机名。
     * 如果没有指定，默认值为 `127.0.0.1`。*/
    hostname?: string;
    transport?: "tcp";
  }

  export interface UnixConnectOptions {
    transport: "unix";
    address: string;
  }

  /**
   * Connects to the hostname (default is "127.0.0.1") and port on the named
   * transport (default is "tcp"), and resolves to the connection (`Conn`).
   * @i18n 通过指定传输协议（默认 "tcp"）连接主机名（默认 "127.0.0.1"）和端口号，并异步返回这个连接（`Conn`）。
   *
   *     const conn1 = await Deno.connect({ port: 80 });
   *     const conn2 = await Deno.connect({ hostname: "192.0.2.1", port: 80 });
   *     const conn3 = await Deno.connect({ hostname: "[2001:db8::1]", port: 80 });
   *     const conn4 = await Deno.connect({ hostname: "golang.org", port: 80, transport: "tcp" });
   *     const conn5 = await Deno.connect({ address: "/foo/bar.sock", transport: "unix" });
   *
   * Requires `allow-net` permission for "tcp" and `allow-read` for unix.
   * @i18n "tcp" 需要 `allow-net` 权限，unix 需要 `allow-read` 权限。*/
  export function connect(
    options: ConnectOptions | UnixConnectOptions
  ): Promise<Conn>;

  export interface ConnectTLSOptions {
    /** The port to connect to.
     * @i18n 要连接的端口。*/
    port: number;
    /** A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `127.0.0.1`.
     * @i18n 可以解析为 IP 地址的文本 IP 地址或主机名。如果没有指定，默认值为 `127.0.0.1`。*/
    hostname?: string;
    /** Server certificate file.
     * @i18n 服务器证书文件。*/
    certFile?: string;
  }

  /** Establishes a secure connection over TLS (transport layer security) using
   * an optional cert file, hostname (default is "127.0.0.1") and port.  The
   * cert file is optional and if not included Mozilla's root certificates will
   * be used (see also https://github.com/ctz/webpki-roots for specifics)
   * @i18n 使用可选的证书文件、主机名（默认值为 "127.0.0.1"）
   * 和端口在 TLS（安全传输层协议）建立安全连接。
   * 证书文件是可选的，如果不包含，则使用 Mozilla 的根证书
   *（具体参见 https://github.com/ctz/webpki-roots）。
   *
   *     const conn1 = await Deno.connectTLS({ port: 80 });
   *     const conn2 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "192.0.2.1", port: 80 });
   *     const conn3 = await Deno.connectTLS({ hostname: "[2001:db8::1]", port: 80 });
   *     const conn4 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "golang.org", port: 80});
   *
   * Requires `allow-net` permission.
   * @i18n 需要 `allow-net` 权限。
   */
  export function connectTLS(options: ConnectTLSOptions): Promise<Conn>;

  /** **UNSTABLE**: not sure if broken or not */
  export interface Metrics {
    opsDispatched: number;
    opsDispatchedSync: number;
    opsDispatchedAsync: number;
    opsDispatchedAsyncUnref: number;
    opsCompleted: number;
    opsCompletedSync: number;
    opsCompletedAsync: number;
    opsCompletedAsyncUnref: number;
    bytesSentControl: number;
    bytesSentData: number;
    bytesReceived: number;
  }

  /** Receive metrics from the privileged side of Deno.  This is primarily used
   * in the development of Deno. 'Ops', also called 'bindings', are the go-between
   * between Deno Javascript and Deno Rust.
   * @i18n 从 Deno 的特权方接收指标。这主要用于 Deno 的开发中。
   * 'Ops'（也称为 'bindings'）是 Deno Javascript 和 Deno Rust 之间的沟通桥梁。
   *
   *      > console.table(Deno.metrics())
   *      ┌─────────────────────────┬────────┐
   *      │         (index)         │ Values │
   *      ├─────────────────────────┼────────┤
   *      │      opsDispatched      │   3    │
   *      │    opsDispatchedSync    │   2    │
   *      │   opsDispatchedAsync    │   1    │
   *      │ opsDispatchedAsyncUnref │   0    │
   *      │      opsCompleted       │   3    │
   *      │    opsCompletedSync     │   2    │
   *      │    opsCompletedAsync    │   1    │
   *      │ opsCompletedAsyncUnref  │   0    │
   *      │    bytesSentControl     │   73   │
   *      │      bytesSentData      │   0    │
   *      │      bytesReceived      │  375   │
   *      └─────────────────────────┴────────┘
   */
  export function metrics(): Metrics;

  /** **UNSTABLE**: reconsider representation.
   * @i18n **不稳定**: 重新考虑表示方法。*/
  interface ResourceMap {
    [rid: number]: string;
  }

  /** **UNSTABLE**: The return type is under consideration and may change.
   * @i18n **不稳定**: 返回类型正在考虑中，并且可能会更改。
   *
   * Returns a map of open _file like_ resource ids (rid) along with their string
   * representations.
   * @i18n 返回打开的_文件_资源 ID（rid）及其字符串表示形式的 Map。
   *
   *       console.log(Deno.resources()); //e.g. { 0: "stdin", 1: "stdout", 2: "stderr" }
   *       Deno.openSync('../test.file');
   *       console.log(Deno.resources()); //e.g. { 0: "stdin", 1: "stdout", 2: "stderr", 3: "fsFile" }
   */
  export function resources(): ResourceMap;

  /** **UNSTABLE**: new API. Needs docs.
   * @i18n **不稳定**: 新 API。需要补充文档。*/
  export interface FsEvent {
    kind: "any" | "access" | "create" | "modify" | "remove";
    paths: string[];
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Watch for file system events against one or more `paths`, which can be files
   * or directories.  These paths must exist already.  One user action (e.g.
   * `touch test.file`) can  generate multiple file system events.  Likewise,
   * one user action can result in multiple file paths in one event (e.g. `mv
   * old_name.txt new_name.txt`).  Recursive option is `true` by default and,
   * for directories, will watch the specified directory and all sub directories.
   * Note that the exact ordering of the events can vary between operating systems.
   * @i18n 监听一个或多个路径的文件系统事件，这个路径可以是文件或者目录，但是必须存在。
   * 一个用户操作（例如 `touch test.file`）可以产生多个文件系统事件。同样，一个
   * 用户操作也可能在一次事件中影响多个路径（例如 `mv old_name.txt new_name.txt`）。
   * 递归选项默认为 `true`，对于目录，将监听指定目录及其所有子目录。
   * 值得注意的是，不同操作系统的事件顺序可能会有所不同。
   *
   *       const iter = Deno.fsEvents("/");
   *       for await (const event of iter) {
   *          console.log(">>>> event", event);  //e.g. { kind: "create", paths: [ "/foo.txt" ] }
   *       }
   *
   * Requires `allow-read` permission.
   * @i18n 需要 `allow-read` 权限。
   */
  export function fsEvents(
    paths: string | string[],
    options?: { recursive: boolean }
  ): AsyncIterableIterator<FsEvent>;

  /** How to handle subprocess stdio.
   * @i18n 如何处理子进程的 stdio。
   *
   * `"inherit"` The default if unspecified. The child inherits from the
   * corresponding parent descriptor.
   * @i18n `"inherit"` 如果未指定，则为默认值。子进程继承父进程的 stdio。
   *
   * `"piped"` A new pipe should be arranged to connect the parent and child
   * sub-processes.
   * @i18n `"piped"` 使用一个新管道来连接父子进程。
   *
   * `"null"` This stream will be ignored. This is the equivalent of attaching
   * the stream to `/dev/null`.
   * @i18n `"null"` 输入输出流将被忽略。这相当于将流附加到了 `/dev/null`。*/
  type ProcessStdio = "inherit" | "piped" | "null";

  /** **UNSTABLE**: The `signo` argument may change to require the Deno.Signal
   * enum.
   * @i18n **UNSTABLE**: `signo` 参数可能需要改成 Deno.Signal 枚举。
   *
   * Send a signal to process under given `pid`. This functionality currently
   * only works on Linux and Mac OS.
   * @i18n 给指定的 `pid` 进程发送信号。这个功能目前只在 Linux 和 Mac OS 上运行。
   *
   * If `pid` is negative, the signal will be sent to the process group
   * identified by `pid`.
   * @i18n 当 `pid` 是负的，信号将会发送到带有 `pid` 标识的进程组。
   *
   *      const p = Deno.run({
   *        cmd: ["python", "-c", "from time import sleep; sleep(10000)"]
   *      });
   *
   *      Deno.kill(p.pid, Deno.Signal.SIGINT);
   *
   * Throws Error (not yet implemented) on Windows
   * @i18n 在 Windows 上抛出错误（尚未实现）。
   *
   * Requires `allow-run` permission.
   * @i18n 需要 `allow-run` 权限。*/
  export function kill(pid: number, signo: number): void;

  /** **UNSTABLE**: There are some issues to work out with respect to when and
   * how the process should be closed.
   * @i18n **UNSTABLE**: 这里有一些关于如何结束进程的问题需要解决。*/
  export class Process {
    readonly rid: number;
    readonly pid: number;
    readonly stdin?: WriteCloser;
    readonly stdout?: ReadCloser;
    readonly stderr?: ReadCloser;
    /** Resolves to the current status of the process.
     * @i18n 解析进程当前的状态。*/
    status(): Promise<ProcessStatus>;
    /** Buffer the stdout and return it as `Uint8Array` after `Deno.EOF`.
     * @i18n 缓冲区中的 stdout，会在 `Deno.EOF` 之后以 `Uint8Array` 的形式返回。
     *
     * You must set stdout to `"piped"` when creating the process.
     * @i18n 在创建进程时，你必须将 stdout 设置为 `"piped"`。
     *
     * This calls `close()` on stdout after its done.
     * @i18n 会在 stdout 完成后调用 `close()`。*/
    output(): Promise<Uint8Array>;
    /** Buffer the stderr and return it as `Uint8Array` after `Deno.EOF`.
     * @i18n 缓冲区中的 stderr， 会在 `Deno.EOF` 之后以 `Uint8Array` 的形式返回。
     *
     * You must set stderr to `"piped"` when creating the process.
     * @i18n 在创建进程时，你必须将 stderr 设置为 `"piped"`。
     *
     * This calls `close()` on stderr after its done.
     * @i18n 会在 stderr 完成后调用 `close()`。*/
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
    kill(signo: number): void;
  }

  export type ProcessStatus =
    | {
        success: true;
        code: 0;
        signal?: undefined;
      }
    | {
        success: false;
        code: number;
        signal?: number;
      };

  /** **UNSTABLE**: `args` has been recently renamed to `cmd` to differentiate from
   * `Deno.args`.
   * @i18n **不稳定**: `args` 最近被重命名为 `cmd`，以区别于 `Deno.args`。*/
  export interface RunOptions {
    /** Arguments to pass. Note, the first element needs to be a path to the
     * binary
     * @i18n 需要传递的参数。注意，第一个元素必须是二进制文件的路径。*/
    cmd: string[];
    cwd?: string;
    env?: {
      [key: string]: string;
    };
    stdout?: ProcessStdio | number;
    stderr?: ProcessStdio | number;
    stdin?: ProcessStdio | number;
  }

  /** Spawns new subprocess.  RunOptions must contain at a minimum the `opt.cmd`,
   * an array of program arguments, the first of which is the binary.
   * @i18n 派生新的子进程。 RunOptions 必须包含 `opt.cmd`，即程序参数数组，其中第一个参数是二进制文件路径。
   *
   * Subprocess uses same working directory as parent process unless `opt.cwd`
   * is specified.
   * @i18n 子进程使用与父进程相同的工作目录，除非指定了 `opt.cwd`。
   *
   * Environmental variables for subprocess can be specified using `opt.env`
   * mapping.
   * @i18n 子进程的环境变量可以使用 `opt.env` 来设置。
   *
   * By default subprocess inherits stdio of parent process. To change that
   * `opt.stdout`, `opt.stderr` and `opt.stdin` can be specified independently -
   * they can be set to either `ProcessStdio` or `rid` of open file.
   * @i18n 默认情况下，子进程继承父进程的 stdio。要更改这些值，可以分别指定`opt.stdout`、`opt.stderr`、`opt.stdin`
   * - 可以将其设置为 `ProcessStdio` 或打开文件的 `rid`。
   *
   * Details of the spawned process are returned.
   * @i18n 返回派生子进程的详细信息。
   *
   *       const p = Deno.run({
   *         cmd: ["echo", "hello"],
   *       });
   *
   * Requires `allow-run` permission.
   * @i18n 需要 `allow-run` 权限。*/
  export function run(opt: RunOptions): Process;

  enum LinuxSignal {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGBUS = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGUSR1 = 10,
    SIGSEGV = 11,
    SIGUSR2 = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGSTKFLT = 16,
    SIGCHLD = 17,
    SIGCONT = 18,
    SIGSTOP = 19,
    SIGTSTP = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGURG = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGIO = 29,
    SIGPWR = 30,
    SIGSYS = 31,
  }
  enum MacOSSignal {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGEMT = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGBUS = 10,
    SIGSEGV = 11,
    SIGSYS = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGURG = 16,
    SIGSTOP = 17,
    SIGTSTP = 18,
    SIGCONT = 19,
    SIGCHLD = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGIO = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGINFO = 29,
    SIGUSR1 = 30,
    SIGUSR2 = 31,
  }

  /** **UNSTABLE**: make platform independent.
   * @i18n **不稳定**: make platform independent.
   *
   * Signals numbers. This is platform dependent.
   * @i18n 信号数字。此值是独立于平台的。*/
  export const Signal: typeof MacOSSignal | typeof LinuxSignal;

  interface InspectOptions {
    showHidden?: boolean;
    depth?: number;
    colors?: boolean;
    indentLevel?: number;
  }

  /** **UNSTABLE**: The exact form of the string output is under consideration
   * and may change.
   * @i18n **不稳定**：字符串输出的确切形式仍在考虑，可能会更改。
   *
   * Converts the input into a string that has the same format as printed by
   * `console.log()`.
   * @i18n 将输入转换为与 `console.log()` 打印格式相同的字符串。
   *
   *      const obj = {};
   *      obj.propA = 10;
   *      obj.propB = "hello"
   *      const objAsString = Deno.inspect(obj); //{ propA: 10, propB: "hello" }
   *      console.log(obj);  // 输出与 objAsString 相同的值，例如: { propA: 10, propB: "hello" }
   *
   * You can also register custom inspect functions, via the `customInspect` Deno
   * symbol on objects, to control and customize the output.
   * @i18n 你还可以通过对象上的 `Deno.symbols.customInspect` 函数
   * 注册自定义的 inspect function，以控制和自定义输出。
   *
   *      class A {
   *        x = 10;
   *        y = "hello";
   *        [Deno.symbols.customInspect](): string {
   *          return "x=" + this.x + ", y=" + this.y;
   *        }
   *      }
   *
   *      const inStringFormat = Deno.inspect(new A()); //"x=10, y=hello"
   *      console.log(inStringFormat);  // 输出 "x=10, y=hello"
   *
   * Finally, a number of output options are also available.
   * @i18n 同时还提供了一些输出选项。
   *
   *      const out = Deno.inspect(obj, {showHidden: true, depth: 4, colors: true, indentLevel: 2});
   *
   */
  export function inspect(value: unknown, options?: InspectOptions): string;

  export type OperatingSystem = "mac" | "win" | "linux";

  export type Arch = "x64" | "arm64";

  interface BuildInfo {
    /** The CPU architecture.
     * @i18n CPU 架构。*/
    arch: Arch;
    /** The operating system.
     * @i18n 操作系统。*/
    os: OperatingSystem;
  }

  /** Build related information.
   * @i18n 构建的相关信息。*/
  export const build: BuildInfo;

  interface Version {
    deno: string;
    v8: string;
    typescript: string;
  }
  /** Version related information.
   * @i18n Deno 的详细版本信息。包括了 deno、v8、typescript。*/
  export const version: Version;

  /** The log category for a diagnostic message.
   * @i18n 诊断消息的日志类别。*/
  export enum DiagnosticCategory {
    Log = 0,
    Debug = 1,
    Info = 2,
    Error = 3,
    Warning = 4,
    Suggestion = 5,
  }

  export interface DiagnosticMessageChain {
    message: string;
    category: DiagnosticCategory;
    code: number;
    next?: DiagnosticMessageChain[];
  }

  export interface DiagnosticItem {
    /** A string message summarizing the diagnostic.
     * @i18n 诊断信息。*/
    message: string;
    /** An ordered array of further diagnostics.
     * @i18n 进一步诊断的有序数组。*/
    messageChain?: DiagnosticMessageChain;
    /** Information related to the diagnostic. This is present when there is a
     * suggestion or other additional diagnostic information
     * @i18n 与诊断相关的信息。当有建议或其他附加诊断信息时会出现。*/
    relatedInformation?: DiagnosticItem[];
    /** The text of the source line related to the diagnostic.
     * @i18n 与诊断相关的所在行的源代码。*/
    sourceLine?: string;
    /** The line number that is related to the diagnostic.
     * @i18n 与诊断相关的行号。*/
    lineNumber?: number;
    /** The name of the script resource related to the diagnostic.
     * @i18n 与诊断相关的文件名称。*/
    scriptResourceName?: string;
    /** The start position related to the diagnostic.
     * @i18n 与诊断相关的位于整个文件的开始位置。*/
    startPosition?: number;
    /** The end position related to the diagnostic.
     * @i18n 与诊断相关的位于整个文件的结束位置。*/
    endPosition?: number;
    /** The category of the diagnostic.
     * @i18n 诊断消息的日志类别。*/
    category: DiagnosticCategory;
    /** A number identifier.
     * @i18n 数字标识符。*/
    code: number;
    /** The the start column of the sourceLine related to the diagnostic.
     * @i18n 与诊断相关的所在行的开始列。*/
    startColumn?: number;
    /** The end column of the sourceLine related to the diagnostic.
     * @i18n 与诊断相关的所在行的结束列。*/
    endColumn?: number;
  }

  export interface Diagnostic {
    /** An array of diagnostic items.
     * @i18n 诊断信息数组。*/
    items: DiagnosticItem[];
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Format an array of diagnostic items and return them as a single string in a
   * user friendly format.
   * @i18n 格式化诊断信息数组，并以用户友好的格式将其作为单个字符串返回。
   *
   *       const [diagnostics, result] = Deno.compile("file_with_compile_issues.ts");
   *       console.table(diagnostics);  // 输出原始诊断信息
   *       console.log(Deno.formatDiagnostics(diagnostics));  // 用户友好方式的输出诊断信息
   *
   * @param items An array of diagnostic items to format
   * @param_i18n items 要格式化的诊断信息数组
   */
  export function formatDiagnostics(items: DiagnosticItem[]): string;

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * A specific subset TypeScript compiler options that can be supported by the
   * Deno TypeScript compiler.
   * @i18n TypeScript 编译选项的特定子集，这些选项能够被 Deno 内置的 TypeScript 编译器支持。*/
  export interface CompilerOptions {
    /** Allow JavaScript files to be compiled. Defaults to `true`.
     * @i18n 允许编译 JavaScript 文件。默认为 `true`。*/
    allowJs?: boolean;
    /** Allow default imports from modules with no default export. This does not
     * affect code emit, just typechecking. Defaults to `false`.
     * @i18n 允许从没有设置默认导出的模块中默认导入。这并不影响代码的输出，仅为了类型检查。默认为 `false`。*/
    allowSyntheticDefaultImports?: boolean;
    /** Allow accessing UMD globals from modules. Defaults to `false`.
     * @i18n 允许从模块中访问 UMD 全局变量。默认为 `false`。*/
    allowUmdGlobalAccess?: boolean;
    /** Do not report errors on unreachable code. Defaults to `false`.
     * @i18n 不报告执行不到的代码错误。默认为 `false`。*/
    allowUnreachableCode?: boolean;
    /** Do not report errors on unused labels. Defaults to `false`
     * @i18n 不报告未使用的标签错误。默认为 `false`。*/
    allowUnusedLabels?: boolean;
    /** Parse in strict mode and emit `"use strict"` for each source file.
     * Defaults to `true`.
     * @i18n 以严格模式解析源文件并为每个源文件生成 `"use strict"` 语句。
     * 默认为 `true`。*/
    alwaysStrict?: boolean;
    /** Base directory to resolve non-relative module names. Defaults to
     * `undefined`.
     * @i18n 解析非相对模块名的基准目录。默认为 `undefined`。*/
    baseUrl?: string;
    /** Report errors in `.js` files. Use in conjunction with `allowJs`. Defaults
     * to `false`.
     * @i18n 报告 `.js` 文件中存在的错误。与 `allowJs` 配合使用。默认为 `false`。*/
    checkJs?: boolean;
    /** Generates corresponding `.d.ts` file. Defaults to `false`.
     * @i18n 生成相应的 `.d.ts` 文件。默认为 `false`。*/
    declaration?: boolean;
    /** Output directory for generated declaration files.
     * @i18n 生成声明文件的输出路径。*/
    declarationDir?: string;
    /** Generates a source map for each corresponding `.d.ts` file. Defaults to
     * `false`.
     * @i18n 为每个 `.d.ts` 文件生成 ource map。默认为 `false`。*/
    declarationMap?: boolean;
    /** Provide full support for iterables in `for..of`, spread and
     * destructuring when targeting ES5 or ES3. Defaults to `false`.
     * @i18n 当编译目标设置为 ES5 或 ES3 时，为 `for..of`、数组解构、数组展开提供完整的迭代支持。默认为 `false`。*/
    downlevelIteration?: boolean;
    /** Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
     * Defaults to `false`.
     * @i18n 在输出文件的开头加入 BOM 头（UTF-8 Byte Order Mark）。默认为 `false`。*/
    emitBOM?: boolean;
    /** Only emit `.d.ts` declaration files. Defaults to `false`.
     * @i18n 只输出 `.d.ts` 文件。默认为 `false`。*/
    emitDeclarationOnly?: boolean;
    /** Emit design-type metadata for decorated declarations in source. See issue
     * [microsoft/TypeScript#2577](https://github.com/Microsoft/TypeScript/issues/2577)
     * for details. Defaults to `false`.
     * @i18n 给源码里的装饰器声明加上设计类型元数据。查看
     * [microsoft/TypeScript#2577](https://github.com/Microsoft/TypeScript/issues/2577)
     * 了解更多信息。默认为 `false`。*/
    emitDecoratorMetadata?: boolean;
    /** Emit `__importStar` and `__importDefault` helpers for runtime babel
     * ecosystem compatibility and enable `allowSyntheticDefaultImports` for type
     * system compatibility. Defaults to `true`.
     * @i18n 为了兼容 babel 运行时生态，输出 `__importStar` 和 `__importDefault` 辅助函数并且开启 `allowSyntheticDefaultImports` 选项。默认为 `true`。*/
    esModuleInterop?: boolean;
    /** Enables experimental support for ES decorators. Defaults to `false`.
     * @i18n 启用实验性的 ES 装饰器。默认为 `false`*/
    experimentalDecorators?: boolean;
    /** Emit a single file with source maps instead of having a separate file.
     * Defaults to `false`.
     * @i18n 生成单个 source maps 文件，而不是将每 source maps 生成不同的文件。
     * 默认为 `false`。*/
    inlineSourceMap?: boolean;
    /** Emit the source alongside the source maps within a single file; requires
     * `inlineSourceMap` or `sourceMap` to be set. Defaults to `false`.
     * @i18n 将代码与 source maps 生成到一个文件中，要求同时设置了 `inlineSourceMap` or `sourceMap` 选项。默认为 `false`。*/
    inlineSources?: boolean;
    /** Perform additional checks to ensure that transpile only would be safe.
     * Defaults to `false`.
     * @i18n 执行额外的检查，确保我的程序代码可以被不进行任何类型检查的编译器正确地编译。
     * 默认为 `false`。*/
    isolatedModules?: boolean;
    /** Support JSX in `.tsx` files: `"react"`, `"preserve"`, `"react-native"`.
     * Defaults to `"react"`.
     * @i18n 为 `.tsx` 文件提供 JSX 支持：`"react"`, `"preserve"`, `"react-native"`。
     * 默认为 `"react"`。*/
    jsx?: "react" | "preserve" | "react-native";
    /** Specify the JSX factory function to use when targeting react JSX emit,
     * e.g. `React.createElement` or `h`. Defaults to `React.createElement`.
     * @i18n 指定生成目标为 JSX 时，使用的 JSX 工厂函数，比如 `React.createElement` 或 `h`。默认为 `React.createElement`。*/
    jsxFactory?: string;
    /** Resolve keyof to string valued property names only (no numbers or
     * symbols). Defaults to `false`.
     * @i18n 只解析字符串属性的 keyof (忽略 numbers 和 symbols)。默认为 `false`。*/
    keyofStringsOnly?: string;
    /** Emit class fields with ECMAScript-standard semantics. Defaults to `false`.
     * Does not apply to `"esnext"` target.
     * @i18n 使用 ECMAScript 标准语义声明类字段。 默认为 `false`。
     * 不适用于生成目标为 `"esnext"`。*/
    useDefineForClassFields?: boolean;
    /** List of library files to be included in the compilation. If omitted,
     * then the Deno main runtime libs are used.
     * @i18n 编译过程中需要引入的库文件的列表。当输出时，Deno 的核心运行库也会使用。*/
    lib?: string[];
    /** The locale to use to show error messages.
     * @i18n 显示错误信息时使用的语言。
     */
    locale?: string;
    /** Specifies the location where debugger should locate map files instead of
     * generated locations. Use this flag if the `.map` files will be located at
     * run-time in a different location than the `.js` files. The location
     * specified will be embedded in the source map to direct the debugger where
     * the map files will be located. Defaults to `undefined`.
     * @i18n 为调试器指定指定 source map 文件的路径，而不是使用生成时的路径。
     * 当 `.map` 文件是在运行时指定的，并不同于 `.js` 文件的地址时使用这个标记。
     * 指定的路径会嵌入到 source map 里告诉调试器到哪里去找它们。默认为 `undefined`。*/
    mapRoot?: string;
    /** Specify the module format for the emitted code. Defaults to
     * `"esnext"`.
     * @i18n 指定生成哪个模块系统代码。默认为 `"esnext"`。*/
    module?:
      | "none"
      | "commonjs"
      | "amd"
      | "system"
      | "umd"
      | "es6"
      | "es2015"
      | "esnext";
    /** Do not generate custom helper functions like `__extends` in compiled
     * output. Defaults to `false`.
     * @i18n 不在输出文件中生成用户自定义的帮助函数代码，如 `__extends`。默认为 `false`。*/
    noEmitHelpers?: boolean;
    /** Report errors for fallthrough cases in switch statement. Defaults to
     * `false`.
     * @i18n 报告 `switch` 语句的 fallthrough 错误。默认为 `false`。*/
    noFallthroughCasesInSwitch?: boolean;
    /** Raise error on expressions and declarations with an implied any type.
     * Defaults to `true`.
     * @i18n 在表达式和声明上有隐含的 `any` 类型时报错。
     * 默认为 `true`*/
    noImplicitAny?: boolean;
    /** Report an error when not all code paths in function return a value.
     * Defaults to `false`.
     * @i18n 当函数的所有返回路径存在没有 `return` 的情况时报错。
     * 默认为 `false`。*/
    noImplicitReturns?: boolean;
    /** Raise error on `this` expressions with an implied `any` type. Defaults to
     * `true`.
     * @i18n 当 `this` 表达式的值为 `any` 类型的时候报错。默认为 `true`。*/
    noImplicitThis?: boolean;
    /** Do not emit `"use strict"` directives in module output. Defaults to
     * `false`.
     * @i18n 不要在模块输出中包含 `"use strict"` 指令。默认为 `false`。*/
    noImplicitUseStrict?: boolean;
    /** Do not add triple-slash references or module import targets to the list of
     * compiled files. Defaults to `false`.
     * @i18n 不把 `/// <reference>` 或模块导入的文件加到编译文件列表。默认为 `false`。*/
    noResolve?: boolean;
    /** Disable strict checking of generic signatures in function types. Defaults
     * to `false`.
     * @i18n 禁用在函数类型里对泛型签名进行严格检查。默认为 `false`。*/
    noStrictGenericChecks?: boolean;
    /** Report errors on unused locals. Defaults to `false`.
     * @i18n 当存在未使用的局部变量时报错。默认为 `false`。*/
    noUnusedLocals?: boolean;
    /** Report errors on unused parameters. Defaults to `false`.
     * @i18n 当存在未使用的参数时报错。默认为 `false`。*/
    noUnusedParameters?: boolean;
    /** Redirect output structure to the directory. This only impacts
     * `Deno.compile` and only changes the emitted file names. Defaults to
     * `undefined`.
     * @i18n 重定向输出目录。这个只影响 `Deno.compile` 并且只改变输出文件的名字。默认为 `undefined`。*/
    outDir?: string;
    /** List of path mapping entries for module names to locations relative to the
     * `baseUrl`. Defaults to `undefined`.
     * @i18n 模块名到基于 `baseUrl` 的路径映射的列表。默认为 `undefined`。*/
    paths?: Record<string, string[]>;
    /** Do not erase const enum declarations in generated code. Defaults to
     * `false`.
     * @i18n 保留 const 和 enum 声明。默认为 `false`。*/
    preserveConstEnums?: boolean;
    /** Remove all comments except copy-right header comments beginning with
     * `/*!`. Defaults to `true`.
     * @i18n 删除所有注释，除了以 `/*!` 开头的版权信息。默认为 `true`。*/
    removeComments?: boolean;
    /** Include modules imported with `.json` extension. Defaults to `true`.
     * @i18n 包含以 `.json` 扩展名引入模块。默认为 `true`。*/
    resolveJsonModule?: boolean;
    /** Specifies the root directory of input files. Only use to control the
     * output directory structure with `outDir`. Defaults to `undefined`.
     * @i18n 指定输出文件的根目录。仅用来控制 `outDir` 输出的目录结构。默认为 `undefined`。*/
    rootDir?: string;
    /** List of _root_ folders whose combined content represent the structure of
     * the project at runtime. Defaults to `undefined`.
     * @i18n 根文件夹列表，表示运行时组合工程结构的内容。默认为 `undefined`。*/
    rootDirs?: string[];
    /** Generates corresponding `.map` file. Defaults to `false`.
     * @i18n 生成对应的 `.map` 文件。默认为 `false`。*/
    sourceMap?: boolean;
    /** Specifies the location where debugger should locate TypeScript files
     * instead of source locations. Use this flag if the sources will be located
     * at run-time in a different location than that at design-time. The location
     * specified will be embedded in the sourceMap to direct the debugger where
     * the source files will be located. Defaults to `undefined`.
     * @i18n 指定 TypeScript 源文件的路径，以便调试器定位。
     * 当 TypeScript 文件的位置是在运行时指定时使用此标记。
     * 路径信息会被加到 sourceMap 里。
     * 默认为 `undefined`。*/
    sourceRoot?: string;
    /** Enable all strict type checking options. Enabling `strict` enables
     * `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`,
     * `strictNullChecks`, `strictFunctionTypes` and
     * `strictPropertyInitialization`. Defaults to `true`.
     * @i18n 启用所有严格类型检查选项。 启用 `strict` 相当于启用
     * `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`,
     * `strictNullChecks`, `strictFunctionTypes` and
     * `strictPropertyInitialization`。默认为 `true`。*/
    strict?: boolean;
    /** Enable stricter checking of the `bind`, `call`, and `apply` methods on
     * functions. Defaults to `true`.
     * @i18n 对函数中的 `bind`, `call`, `apply` 方法启用更严格的检查。默认为 `true`。*/
    strictBindCallApply?: boolean;
    /** Disable bivariant parameter checking for function types. Defaults to
     * `true`.
     * @i18n 禁用函数参数双向协变检查。默认为 `true`。*/
    strictFunctionTypes?: boolean;
    /** Ensure non-undefined class properties are initialized in the constructor.
     * This option requires `strictNullChecks` be enabled in order to take effect.
     * Defaults to `true`.
     * @i18n 确保类的非 undefined 属性已经在构造函数里初始化。
     * 若要令此选项生效，需要同时启用 `strictNullChecks`。
     * 默认为 `true`。*/
    strictPropertyInitialization?: boolean;
    /** In strict null checking mode, the `null` and `undefined` values are not in
     * the domain of every type and are only assignable to themselves and `any`
     * (the one exception being that `undefined` is also assignable to `void`).
     * @i18n 在严格的 null 检查模式下， `null` 和 `undefined` 值不包含在任何类型里。
     * 只允许用它们自己和 `any` 来赋值。
     * (例外的是 `undefined` 可以赋值到 `void` )。 */
    strictNullChecks?: boolean;
    /** Suppress excess property checks for object literals. Defaults to
     * `false`.
     * @i18n 阻止对对象字面量的额外属性检查。默认为 `false`。*/
    suppressExcessPropertyErrors?: boolean;
    /** Suppress `noImplicitAny` errors for indexing objects lacking index
     * signatures.
     * @i18n 阻止 `noImplicitAny` 对缺少索引签名的索引对象报错。*/
    suppressImplicitAnyIndexErrors?: boolean;
    /** Specify ECMAScript target version. Defaults to `esnext`.
     * @i18n 指定 ECMAScript 目标版本。默认为 `esnext`。*/
    target?:
      | "es3"
      | "es5"
      | "es6"
      | "es2015"
      | "es2016"
      | "es2017"
      | "es2018"
      | "es2019"
      | "es2020"
      | "esnext";
    /** List of names of type definitions to include. Defaults to `undefined`.
     *
     * The type definitions are resolved according to the normal Deno resolution
     * irrespective of if sources are provided on the call. Like other Deno
     * modules, there is no "magical" resolution. For example:
     * @i18n 需要包含的类型声明文件名称列表。默认为 `undefined`。
     *  该类型定义是解决了符合普通的 Deno 类型解析。
     *  无论资源是否提供来源。
     *  就像其他的 Deno 模块, 没有“神奇”的解决方法。例如：
     *
     *      Deno.compile(
     *        "./foo.js",
     *        undefined,
     *        {
     *          types: [ "./foo.d.ts", "https://deno.land/x/example/types.d.ts" ]
     *        }
     *      );
     */
    types?: string[];
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**：新的 API，尚待审核。
   *
   * The results of a transpile only command, where the `source` contains the
   * emitted source, and `map` optionally contains the source map.
   * @i18n transpile only 命令的结果，其中 `source`
   * 为转化后的源码，而 `map` 则为源码的 source map。*/
  export interface TranspileOnlyResult {
    source: string;
    map?: string;
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**：新的 API，尚待审核。
   *
   * Takes a set of TypeScript sources and resolves to a map where the key was
   * the original file name provided in sources and the result contains the
   * `source` and optionally the `map` from the transpile operation. This does no
   * type checking and validation, it effectively "strips" the types from the
   * file.
   * @i18n 给定一组 TypeScript 类型的源码 (sources)，返回解析后的映射，
   * 其中的 key 是 sources 的 key，结果则包含转化过的源码及源码的 source map。
   * 此函数并不进行类型校检，它可以有效地从文件中 “删除” 类型。
   *
   *      const results =  await Deno.transpileOnly({
   *        "foo.ts": `const foo: string = "foo";`
   *      });
   *
   * @param sources A map where the key is the filename and the value is the text
   *                to transpile. The filename is only used in the transpile and
   *                not resolved, for example to fill in the source name in the
   *                source map.
   * @param_i18n sources key 是文件名，value 是要转换的源码。
   *                     文件扩展名并不会被解析，仅用作解析结果的 key。
   * @param options An option object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
   *                Many of the options related to type checking and emitting
   *                type declaration files will have no impact on the output.
   * @param_i18n options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function transpileOnly(
    sources: Record<string, string>,
    options?: CompilerOptions
  ): Promise<Record<string, TranspileOnlyResult>>;

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**：新的 API，尚待审核。
   *
   * Takes a root module name, and optionally a record set of sources. Resolves
   * with a compiled set of modules and possibly diagnostics if the compiler
   * encountered any issues. If just a root name is provided, the modules
   * will be resolved as if the root module had been passed on the command line.
   * @i18n 它接受根模块名 rootName，及 Record<string, string> 类型的可选参数
   * sources 做为模块源。返回编译后的模块集合及编译过程中遇到的问题的诊断信息。
   * 如果仅传了 rootName，那么模块解析结果同命令行一致。
   *
   * If sources are passed, all modules will be resolved out of this object, where
   * the key is the module name and the value is the content. The extension of
   * the module name will be used to determine the media type of the module.
   * @i18n 如果传递了 sources，则所有模块都将从该 sources 对象中解析出来，
   * 其中键是模块名称，值是内容。模块名称的扩展名将用于确定模块的类型。
   *
   *      const [ maybeDiagnostics1, output1 ] = await Deno.compile("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.compile("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName The root name of the module which will be used as the
   *                 "starting point". If no `sources` is specified, Deno will
   *                 resolve the module externally as if the `rootName` had been
   *                 specified on the command line.
   * @param_i18n rootName 作为 “起点” 的模块名。如果没有传递 `sources` 参数,
   *                      Deno 将从外部解析模块，就像在命令行中指定了 `rootName` 一样。
   * @param sources An optional key/value map of sources to be used when resolving
   *                modules, where the key is the module name, and the value is
   *                the source content. The extension of the key will determine
   *                the media type of the file when processing. If supplied,
   *                Deno will not attempt to resolve any modules externally.
   * @param_i18n sources 可选参数，解析模块时使用的 key/value 对象，其中 key 是模块名，value 是源内容。
   *                     key 的扩展名决定了解析模块的类型。如果提供此参数，Deno 将不会尝试从外部解析任何模块。
   * @param options An optional object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
   * @param_i18n options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function compile(
    rootName: string,
    sources?: Record<string, string>,
    options?: CompilerOptions
  ): Promise<[DiagnosticItem[] | undefined, Record<string, string>]>;

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**：新的 API，尚待审核。
   *
   * `bundle()` is part the compiler API.  A full description of this functionality
   * can be found in the [manual](https://deno.land/std/manual.md#denobundle).
   * @i18n `bundle()` 是编译器 API 的一部分。有关此功能的完整说明，
   * 请参见 [手册](https://deno.land/std/manual.md#denobundle)。
   *
   * Takes a root module name, and optionally a record set of sources. Resolves
   * with a single JavaScript string (and bundle diagnostics if issues arise with
   * the bundling) that is like the output of a `deno bundle` command. If just
   * a root name is provided, the modules will be resolved as if the root module
   * had been passed on the command line.
   * @i18n 它接受根模块名 rootName，及可选参数 sources 做为模块源。
   * 就像使用 `deno bundle` 命令输出的结果一样，其返回值是一个
   * JavaScript 字符串（如果在打包过程中出现错误, 则会返回错误诊断信息）。
   * 如果仅传了 rootName，那么模块解析结果同命令行一致。
   *
   * If sources are passed, all modules will be resolved out of this object, where
   * the key is the module name and the value is the content. The extension of the
   * module name will be used to determine the media type of the module.
   * @i18n 如果传递了 sources，则所有模块都将从该 sources 对象中解析出来，
   * 其中键是模块名称，值是内容。模块名称的扩展名将用于确定模块的类型。
   *
   *      // 相当于执行 "deno bundle foo.ts" 命令
   *      const [ maybeDiagnostics1, output1 ] = await Deno.bundle("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.bundle("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName The root name of the module which will be used as the
   *                 "starting point". If no `sources` is specified, Deno will
   *                 resolve the module externally as if the `rootName` had been
   *                 specified on the command line.
   * @param_i18n rootName 作为 “起点” 的模块名。如果没有传递 `sources` 参数,
   *                      Deno 将从外部解析模块，就像在命令行中指定了 `rootName` 一样。
   * @param sources An optional key/value map of sources to be used when resolving
   *                modules, where the key is the module name, and the value is
   *                the source content. The extension of the key will determine
   *                the media type of the file when processing. If supplied,
   *                Deno will not attempt to resolve any modules externally.
   * @param_i18n sources 可选参数，解析模块时使用的 key/value 对象，其中 key 是模块名，value 是源内容。
   *                     key 的扩展名决定了解析模块的类型。如果提供此参数，Deno 将不会尝试从外部解析任何模块。
   * @param options An optional object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
   * @param_i18n options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function bundle(
    rootName: string,
    sources?: Record<string, string>,
    options?: CompilerOptions
  ): Promise<[DiagnosticItem[] | undefined, string]>;

  /** Returns the script arguments to the program. If for example we run a
   * program:
   * @i18n 将脚本参数返回给程序。例如我们运行下方的程序
   *
   *      deno --allow-read https://deno.land/std/examples/cat.ts /etc/passwd
   *
   * Then `Deno.args` will contain:
   * @i18n 此时 `Deno.args` 将包含:
   *
   *      [ "/etc/passwd" ]
   */
  export const args: string[];

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Represents the stream of signals, implements both `AsyncIterator` and
   * `PromiseLike`.
   * @i18n 信号流，实现了 `AsyncIterator` 和 `PromiseLike` 接口。*/
  export class SignalStream
    implements AsyncIterableIterator<void>, PromiseLike<void> {
    constructor(signal: typeof Deno.Signal);
    then<T, S>(
      f: (v: void) => T | Promise<T>,
      g?: (v: void) => S | Promise<S>
    ): Promise<T | S>;
    next(): Promise<IteratorResult<void>>;
    [Symbol.asyncIterator](): AsyncIterableIterator<void>;
    dispose(): void;
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。
   *
   * Returns the stream of the given signal number. You can use it as an async
   * iterator.
   * @i18n 返回指定信号编码的流。返回值可用于异步迭代。
   *
   *      for await (const _ of Deno.signal(Deno.Signal.SIGTERM)) {
   *        console.log("got SIGTERM!");
   *      }
   *
   * You can also use it as a promise. In this case you can only receive the
   * first one.
   * @i18n 也可以把它作为 Promise 来使用。在这种情况下，只能收到第一个值。
   *
   *      await Deno.signal(Deno.Signal.SIGTERM);
   *      console.log("SIGTERM received!")
   *
   * If you want to stop receiving the signals, you can use `.dispose()` method
   * of the signal stream object.
   * @i18n 如果要停止接收信号，可以使用信号流对象(`SignalStream`)的 `.dispose()` 方法。
   *
   *      const sig = Deno.signal(Deno.Signal.SIGTERM);
   *      setTimeout(() => { sig.dispose(); }, 5000);
   *      for await (const _ of sig) {
   *        console.log("SIGTERM!")
   *      }
   *
   * The above for-await loop exits after 5 seconds when `sig.dispose()` is
   * called.
   * @i18n 当调用 `sig.dispose()` 5 秒后，上述 for-await 循环退出。
   *
   * NOTE: This functionality is not yet implemented on Windows.
   * @i18n 注意: 这个功能还没有在 Windows 上实现。
   */
  export function signal(signo: number): SignalStream;

  /** **UNSTABLE**: new API, yet to be vetted.
   * @i18n **不稳定**: 新 API，没有经过审查。*/
  export const signals: {
    /** Returns the stream of SIGALRM signals.
     * @i18n 返回 SIGALRM 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGALRM)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGALRM)` 的简写形式。*/
    alarm: () => SignalStream;
    /** Returns the stream of SIGCHLD signals.
     * @i18n 返回 SIGCHLD 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGCHLD)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGCHLD)` 的简写形式。*/
    child: () => SignalStream;
    /** Returns the stream of SIGHUP signals.
     * @i18n 返回 SIGHUP 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGHUP)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGHUP)` 的简写形式。*/
    hungup: () => SignalStream;
    /** Returns the stream of SIGINT signals.
     * @i18n 返回 SIGINT 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGINT)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGINT)` 的简写形式。*/
    interrupt: () => SignalStream;
    /** Returns the stream of SIGIO signals.
     * @i18n 返回 SIGIO 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGIO)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGIO)` 的简写形式。*/
    io: () => SignalStream;
    /** Returns the stream of SIGPIPE signals.
     * @i18n 返回 SIGPIPE 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGPIPE)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGPIPE)` 的简写形式。*/
    pipe: () => SignalStream;
    /** Returns the stream of SIGQUIT signals.
     * @i18n 返回 SIGQUIT 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGQUIT)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGQUIT)` 的简写形式。*/
    quit: () => SignalStream;
    /** Returns the stream of SIGTERM signals.
     * @i18n 返回 SIGTERM 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGTERM)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGTERM)` 的简写形式。*/
    terminate: () => SignalStream;
    /** Returns the stream of SIGUSR1 signals.
     * @i18n 返回 SIGUSR1 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGUSR1)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGUSR1)` 的简写形式。*/
    userDefined1: () => SignalStream;
    /** Returns the stream of SIGUSR2 signals.
     * @i18n 返回 SIGUSR2 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGUSR2)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGUSR2)` 的简写形式。*/
    userDefined2: () => SignalStream;
    /** Returns the stream of SIGWINCH signals.
     * @i18n 返回 SIGWINCH 信号流。
     *
     * This method is the shorthand for `Deno.signal(Deno.Signal.SIGWINCH)`.
     * @i18n 此方法是 `Deno.signal(Deno.Signal.SIGWINCH)` 的简写形式。*/
    windowChange: () => SignalStream;
  };

  /** **UNSTABLE**: new API. Maybe move `Deno.EOF` here.
   * @i18n **不稳定**: 新 API。可能会把 `Deno.EOF` 移动到这里。
   *
   * Special Deno related symbols.
   * @i18n 与 Deno 相关的 `Symbol`。*/
  export const symbols: {
    /** Symbol to access exposed internal Deno API
     * @i18n 用于将 Deno 内部 API 暴露出来的 Symbol */
    readonly internal: unique symbol;
    /** A symbol which can be used as a key for a custom method which will be
     * called when `Deno.inspect()` is called, or when the object is logged to
     * the console.
     * @i18n 这个 Symbol 可以作为 key 来定义一个方法，当 `Deno.inspect()` 被调用或者调用了
     * console 的日志方法时，这个自定义函数被调用。*/
    readonly customInspect: unique symbol;
    // TODO(ry) move EOF here?
  };
}
