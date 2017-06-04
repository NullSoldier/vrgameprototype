set -e

git branch -D deploy || true
git checkout -b deploy

cd client
gulp 
git add dist -f
cd ..

cp server/package.json .
git add .
git commit -m "Build"

echo Deploying
git push heroku deploy:master -f
git checkout master
