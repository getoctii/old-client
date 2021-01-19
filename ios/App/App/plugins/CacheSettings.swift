//
//  CacheSettings.swift
//  App
//
//  Created by Adam on 1/19/21.
//

import Foundation

//@objc (CacheSettings)
public class CacheSettings {
  struct SettingsBundleKeys {
    static let clearCache = "CLEAR_APP_CACHE"
  }
//  @objc func clear(_ call: CAPPluginCall) {
    
//  }
  class func checkAndExecuteSettings() {
    if UserDefaults.standard.bool(forKey: SettingsBundleKeys.clearCache) {
      UserDefaults.standard.set(false, forKey: SettingsBundleKeys.clearCache)
      let appDomain: String? = Bundle.main.bundleIdentifier
      UserDefaults.standard.removePersistentDomain(forName: appDomain!)
      // reset userDefaults..
      // CoreDataDataModel().deleteAllData()
      // delete all other user data here..
    }
  }
}
