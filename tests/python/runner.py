from os.path import dirname
import unittest

if __name__ == "__main__":
  testsuite = unittest.TestLoader().discover(dirname(__file__))
  unittest.TextTestRunner(verbosity=1).run(testsuite)
