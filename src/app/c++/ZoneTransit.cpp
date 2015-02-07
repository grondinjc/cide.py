/****************************************************************************
 *  Classe: 			ZoneTransit     																					*
 *  Auteur: 			Mariane Maynard 																					*
 *	Description:	Classe servant a stocker temporairement les modifications	*
									d'un fichier sur le serveur en attendant d'etre resolues	*
 ****************************************************************************/

#include<vector>
#include<mutex>
#include <boost/python.hpp>

using std::vector;
using std::mutex;

class Modification
{
	private:
		int position;
	public:
		int getPosition() const {return position;}
};

class Fichier
{
};

struct ZoneTransit
{
  private:
    vector<Modification> _modifications;
    Fichier _file;
    mutex _mutex;

  public:
		//ajoute les Modifications par ordre croissant de leur position
    void add(Modification m)
		{
			_mutex.lock();
			for(auto it = _modifications.begin(); it != _modifications.end(); ++it)
			{
				if(it->getPosition() > m.getPosition())
				{
					_modifications.insert(it,m);
					break;
				}
			}
			_mutex.unlock();
		}

		//enleve et retourne le dernier element (avec la plus grande position)
    Modification remove()
		{
			_mutex.lock();
			Modification m = _modifications.back();
			_modifications.pop_back();
			_mutex.unlock();
			return m;
		}
};

BOOST_PYTHON_MODULE(ZoneTransit)
{
  using namespace boost::python;
	class_<ZoneTransit>("ZoneTransit")
		.def("add", &ZoneTransit::add)
		.def("remove", &ZoneTransit::remove);
};

