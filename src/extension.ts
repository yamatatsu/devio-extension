import * as vscode from "vscode";
import * as fs from 'fs';
import { initializeCommands } from "./context/commands";
import { initializeTreeView } from "./context/treeview";
import { initializeWebView } from "./context/webview";
import * as listeners from "./context/listeners";

import { WebViewProvider } from "./webview/webViewProvider";
import { ArticlesTreeViewProvider } from "./treeview/articlesTreeViewProvider";
import * as util from "./util";

/** 拡張内の共通の情報をまとめたオブジェクト */
export interface AppContext {
	extension: vscode.ExtensionContext
	articlesFolderUri: vscode.Uri;
	conf: vscode.WorkspaceConfiguration
}

// 拡張がアクティベートされる時に実行される関数
export function activate(extensionContext: vscode.ExtensionContext) {
	const workspaceUri = vscode.workspace.workspaceFolders?.[0].uri;

	if (!workspaceUri) {
		return vscode.window.showErrorMessage("ワークスペースがありません");
	}

	const articleUri = vscode.Uri.joinPath(workspaceUri, "articles");

	if (!fs.existsSync(articleUri.fsPath)) {
		fs.mkdirSync(articleUri.fsPath);
		vscode.window.showInformationMessage("created article directory");
	}

	const context: AppContext = {
		extension: extensionContext,
		articlesFolderUri: articleUri,
		conf: vscode.workspace.getConfiguration('contentful.general')
	};

	const tviewProvider = new ArticlesTreeViewProvider(context);
	const webViewProvider = new WebViewProvider(context);
	extensionContext.subscriptions.push(
		...initializeCommands(context, tviewProvider),
		...initializeTreeView(context, tviewProvider, webViewProvider),
		...initializeWebView(context, webViewProvider),
		listeners.initializeMarkdownSaveListener(context,webViewProvider)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
