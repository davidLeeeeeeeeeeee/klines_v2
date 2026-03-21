from pandas import DataFrame
from freqtrade.strategy import IStrategy
import talib.abstract as ta


class BollRangeStrategy(IStrategy):
    INTERFACE_VERSION = 3

    timeframe = "1m"

    can_short = False

    minimal_roi = {
        "0": 0.01
    }

    stoploss = -0.03

    trailing_stop = False
    process_only_new_candles = True
    startup_candle_count = 30

    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = False

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        boll = ta.BBANDS(
            dataframe,
            timeperiod=20,
            nbdevup=2.0,
            nbdevdn=2.0,
            matype=0
        )

        dataframe["bb_upperband"] = boll["upperband"]
        dataframe["bb_middleband"] = boll["middleband"]
        dataframe["bb_lowerband"] = boll["lowerband"]

        dataframe["rsi"] = ta.RSI(dataframe, timeperiod=14)
        dataframe["volume_mean_20"] = dataframe["volume"].rolling(20).mean()

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (dataframe["close"] < dataframe["bb_lowerband"]) &
                (dataframe["rsi"] < 35) &
                (dataframe["volume"] > 0) &
                (dataframe["volume"] > dataframe["volume_mean_20"] * 0.5)
            ),
            ["enter_long", "enter_tag"]
        ] = (1, "boll_lower_revert")

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe.loc[
            (
                (
                    (dataframe["close"] >= dataframe["bb_middleband"]) |
                    (dataframe["rsi"] > 55)
                ) &
                (dataframe["volume"] > 0)
            ),
            ["exit_long", "exit_tag"]
        ] = (1, "boll_mid_exit")

        return dataframe